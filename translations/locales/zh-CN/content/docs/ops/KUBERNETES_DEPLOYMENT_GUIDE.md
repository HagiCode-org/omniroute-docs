---
title: "Kubernetes 部署指南"
version: 3.8.51
lastUpdated: 2026-09-22
---

# Kubernetes 部署指南（k3s 与 k8s）

用于在 Kubernetes 上运行 OmniRoute 的清单与 Helm chart，适用于 k3s（单节点或小型集群）和通用 k8s。

| 路径                             | 说明                                                 |
| -------------------------------- | ---------------------------------------------------- |
| `deploy/kubernetes/base/`        | Kustomize 基础配置：Deployment、Service、PVC、ConfigMap |
| `deploy/kubernetes/overlays/k3s` | Traefik Ingress + `local-path` 存储                  |
| `deploy/kubernetes/overlays/k8s` | ingress-nginx + 集群默认存储                         |
| `deploy/helm/omniroute/`         | Helm chart（拓扑相同，由 values 驱动）               |
| `omniroute deploy k8s`           | 输出根据当前实例设置生成的清单                       |

相关文档：[Docker 指南](../guides/DOCKER_GUIDE.md) ·
[监控——探针](MONITORING_GUIDE.md#kubernetes-probe-recommendations) ·
[SQLite 运行时](SQLITE_RUNTIME.md)

---

## 部署前请先阅读

**OmniRoute 在 Kubernetes 上只能以单副本运行。这是既定设计，而不是可以向上扩容的起点。**

原版 OmniRoute 是单个 Node 进程，写入单个 SQLite 文件。两个 Pod 绑定到同一卷会损坏数据库。下文的所有约束都由此而来：

| 约束                  | 对你意味着什么                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 始终为 `replicas: 1`  | 当 `replicaCount > 1` 时，Helm chart **拒绝渲染**。Kustomize 基础配置同样固定了该值。                                  |
| `strategy: Recreate`  | RollingUpdate 会短暂运行两个写入方。Recreate 意味着**每次升级都是一次短暂的完全停机**。                                |
| ReadWriteOnce PVC     | Chart 会拒绝任何其他访问模式。切勿使用 NFS/CIFS——在网络文件系统上，SQLite 使用 WAL 日志会发生损坏。                    |
| 禁止滚动重启          | 每次 Pod 重启都会中断所有进行中的 SSE 流和仪表盘会话。                                                                 |

如需更多容量，请运行 **N 个相互独立的 Helm release**，每个都有自己的 PVC，参见下文的[横向扩展](#横向扩展)。多写入方高可用（HA）在上游的 [#8075](https://github.com/diegosouzapw/OmniRoute/issues/8075) 中跟踪，目前不是受支持的方案。

---

## 前提条件

- 一个集群：k3s ≥ 1.27 或任意 k8s ≥ 1.27
- `kubectl`（已内置 Kustomize），以及使用 chart 方式时需要 `helm` ≥ 3.12
- 支持 `ReadWriteOnce` 且使用真实块存储的 StorageClass
- 如果希望在端口转发之外暴露仪表盘，需要一个 Ingress 控制器

---

## 1. 创建 Secret

切勿提交这些内容。`deploy/kubernetes/base/secret.example.yaml` 只是包含占位符的模板，并且刻意**不**被基础 kustomization 引用——应用它会让 OmniRoute 以虚假的认证密钥启动。

```bash
kubectl create namespace omniroute

kubectl -n omniroute create secret generic omniroute-secrets \
  --from-literal=JWT_SECRET="$(openssl rand -base64 48)" \
  --from-literal=API_KEY_SECRET="$(openssl rand -hex 32)" \
  --from-literal=STORAGE_ENCRYPTION_KEY="$(openssl rand -hex 32)" \
  --from-literal=INITIAL_PASSWORD="$(openssl rand -base64 24)"
```

首次登录时读取 `INITIAL_PASSWORD`，然后立即在仪表盘中修改它：

```bash
kubectl -n omniroute get secret omniroute-secrets \
  -o jsonpath='{.data.INITIAL_PASSWORD}' | base64 -d; echo
```

> **`STORAGE_ENCRYPTION_KEY` 用于静态加密提供者凭据。** 丢失它会导致所有已存储的提供者连接都无法读取。请将其备份到集群之外的位置，并且只能通过文档中记载的重新加密路径轮换——切勿直接编辑 Secret 来修改。

---

## 2a. 使用 Kustomize 部署

请先编辑 overlay 中的 Ingress 主机名（k3s 上为 `omniroute.local`，k8s 上为 `omniroute.example.com`），然后执行：

```bash
# k3s
kubectl apply -k deploy/kubernetes/overlays/k3s

# generic k8s
kubectl apply -k deploy/kubernetes/overlays/k8s
```

在不执行应用的情况下预览（每次变更前都值得这样做）：

```bash
kubectl kustomize deploy/kubernetes/overlays/k3s
```

观察启动过程。冷启动会执行 SQLite 迁移、重放 WAL、在旧版调用日志卸载中重建文件，并在启动清理阶段回收空闲页——数据库较大时可能需要数分钟。启动探针允许 10 分钟，之后存活检查才开始计数；就绪探针会在所需的时间内持续拦截流量：

```bash
kubectl -n omniroute rollout status deploy/omniroute
kubectl -n omniroute logs -f deploy/omniroute
```

## 2b. 使用 Helm 部署

```bash
helm upgrade --install omniroute deploy/helm/omniroute \
  --namespace omniroute --create-namespace \
  --set secrets.existingSecret=omniroute-secrets \
  --set persistence.storageClass=local-path \
  --set ingress.enabled=true \
  --set ingress.className=traefik \
  --set ingress.hosts[0].host=omniroute.example.com
```

优先使用 `secrets.existingSecret` 而不是 `secrets.create=true`：通过 `--set` 传入的值会留在 Helm release 历史和你的 shell 历史中。

在以下情况下，Chart 会快速失败，并给出说明性提示，而不会生成损坏的 release：`replicaCount > 1`、非 RWO 访问模式、关闭时限与终止宽限期不匹配、未配置 Secret，以及同时设置 `secrets.create` 和 `secrets.existingSecret`。

## 2c. 还没有 Ingress？

```bash
kubectl -n omniroute port-forward svc/omniroute 20128:20128
# http://localhost:20128
```

---

## 2d. 改为从当前实例生成

上面的清单是可供你编辑的起点。如果某个实例已经按你期望的方式配置好，`omniroute deploy k8s` 会输出等效的清单，并填入这些设置，因此你无需手动抄写端口、来源和参数。

它输出到标准输出，不会修改任何内容：

```bash
# k3s on this machine
omniroute deploy k8s --target local | kubectl apply -f -

# a cluster other people can reach
omniroute deploy k8s --target vps --host llms.example.com > omniroute.yaml
kubectl --context omniroute-vps apply -f omniroute.yaml
```

两个目标仅默认值不同。`local` 假定此处为 k3s：Traefik、`local-path` 存储、无 TLS。`vps` 假定前面有一个真实主机名，且集群可被他人访问，因此会启用 TLS，设置 `REQUIRE_API_KEY=true`，绑定集群默认的 StorageClass，并根据你传入的主机推导 `LIVE_WS_ALLOWED_ORIGINS`。其他所有设置都是参数——`omniroute deploy k8s --help` 会列出它们。

如果配置在运行时会失败，该命令会拒绝输出：堆上限等于或高于内存限制（会被 OOMKilled，而不是可恢复的堆错误）、关闭时限大于终止宽限期（SSE 在排空过程中被截断，而不是被完整排空），或 Ingress 没有主机。此时命令以退出码 `2` 结束，并指出出错的字段。

它不会替你决定拓扑所禁止的任何内容：副本数、更新策略和卷访问模式都固定在生成器中，不作为参数暴露。

## 2e. 创建集群

如果还没有集群，`provision` 会输出用于搭建集群的命令：

```bash
omniroute deploy k8s provision --target local
omniroute deploy k8s provision --target vps --server 203.0.113.10
```

**OmniRoute 从不运行这些命令，也从不连接服务器。** 预配属于需要特权的主机级操作；如果由一个长期运行的代理来执行，就意味着要随程序分发 SSH 客户端并持有私钥——对于一次性任务而言，这会带来很大的长期暴露面。你应阅读这些命令并自行执行，其形式与 [contrib/vps](../../contrib/vps/README.md) 相同。

VPS 输出中有两处细节，手工操作时很容易出错：

- **`--tls-san <address>`** 会将公网地址写入 API 服务器证书。缺少它时，集群只能通过 `127.0.0.1` 访问，远程 `kubectl` 会在没有明显原因的情况下 TLS 校验失败。
- **k3s 写入的 kubeconfig 指向 `127.0.0.1`**，即 VPS 本机。该方案会在合并进 `~/.kube/config` 之前改写该地址并重命名上下文，以免与已有的 `default` 冲突。

端口 6443 是 Kubernetes API。请按源地址限制访问，或通过专用网络或隧道访问它，方案中包含为此设置的 `ufw` 步骤。生成的 kubeconfig 是完整的集群凭据，请像对待私钥一样对待它。

上下文创建完成后，使用 `--context` 部署到该上下文，方式与部署到任何其他集群完全相同。

---

## 3. Ingress 与 SSE

这一步最容易让人误以为“OmniRoute 卡住了”，而实际上问题出在 Ingress 控制器。`/v1/chat/completions` 以流式返回；如果代理对响应进行缓冲，就会一直持有整个流，直到提供者轮次结束。

### ingress-nginx

k8s overlay 已经设置了这些项。如果你编写自己的 Ingress，请保留它们：

```yaml
nginx.ingress.kubernetes.io/proxy-buffering: "off"
nginx.ingress.kubernetes.io/proxy-request-buffering: "off"
nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
nginx.ingress.kubernetes.io/proxy-body-size: "32m"
```

如果没有 `proxy-buffering: off`，客户端在响应完成之前什么也看不到——这与挂起的请求难以区分。

### 单独暴露仪表盘

overlay 默认提供**一个** Ingress，它将仪表盘与 `/v1` 放在同一主机上，并使用相同的认证方式。在私有集群上这没有问题。但在可被访问的集群上，这意味着仪表盘的防护强度仅相当于 `INITIAL_PASSWORD`——而已发布镜像默认将其设为 `CHANGEME`。

两类使用者的差异如此之大，无法放进同一个 Ingress 资源中，因为它们需要不同的认证方式。`deploy/kubernetes/overlays/k8s/ingress-split-example.yaml` 展示了拆分方式：`/v1` 与 `/api/v1` 位于由 `REQUIRE_API_KEY=true` 保护的 API 主机上，仪表盘则位于其独立主机上，并由外部身份提供者保护（示例中为 oauth2-proxy）。在 overlay 的 `resources:` 中用它替换 `ingress.yaml`，并同时设置两个主机名。

请求体大小注解对 API Ingress 尤其重要：它的值不得低于 `OMNIROUTE_CHAT_HARD_MAX_BODY_BYTES`（默认 50 MB），否则 nginx 会对应用本可接受的请求返回 413——而应用自身的 413 响应（它会告诉客户端压缩后重试）则永远不会被触发。

### k3s：Traefik 超时

Traefik 默认不缓冲地流式转发，因此 SSE 开箱即用。它在默认配置下的问题在于空闲超时：较长的提供者轮次会被截断。应在 **entrypoint（入口点）** 上调高该值，而不是针对单个 Ingress——在 k3s 上，这需要通过 `HelmChartConfig` 完成：

```yaml
# /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    ports:
      web:
        transport:
          respondingTimeouts:
            readTimeout: 0
            idleTimeout: 600s
```

k3s 会自动同步该文件，无需重启。

### WebSocket

仪表盘的实时视图使用端口 20132 上的 WebSocket，并通过 Service 以 `live-ws` 暴露。以下两点必须一致，否则浏览器会悄无声息地退回到轮询：

1. 通过你的 Ingress 路由 `live-ws`（或使用单独的主机/路径）。
2. 将 `LIVE_WS_ALLOWED_ORIGINS` 设置为仪表盘的真实来源——默认值仅允许 `localhost`，来源不匹配时会在服务端被拒绝。

---

## 4. 探针

清单遵循 [MONITORING_GUIDE.md](MONITORING_GUIDE.md#kubernetes-probe-recommendations) 中的建议：

| 探针 | 目标                      | 原因                                                     |
| ---- | ------------------------- | -------------------------------------------------------- |
| 启动 | `GET /healthz`，120 × 5s  | 冷启动 = 迁移 + WAL 重放 + 文件重建                      |
| 就绪 | `GET /healthz`            | 生命周期状态；200 或 503                                 |
| 存活 | **tcpSocket**，目标为 `http` | 仅检查进程是否存活，且不会被事件循环“饿死”             |

**切勿将存活探针指向 `/api/monitoring/health`。** 该接口会执行真实的数据库与监控工作，在高负载下会误判失败，从而重启你唯一的 Pod。

### 为什么存活探针默认使用 TCP

`better-sqlite3` 是同步的。大型检查点或 `VACUUM` 会在运行期间阻塞事件循环——在网络存储上，对于数百 MB 的数据库可能持续数分钟——此时进程虽然完全正常，但所有 HTTP 处理器都会停止响应。`/livez` 也不例外：它与事件循环共享同一线程。

由此产生的故障会自我放大，并且在这种拓扑下的生产环境中已被观察到：HTTP 存活探针在 VACUUM 中途超时 → kubelet 杀掉 Pod → 被中断的写入留下了更大的 WAL → 下一次冷启动更慢 → 再次被杀掉。

这种不对称性决定了默认值。错误配置的 HTTP 存活探针会在写入途中重启 Pod，并使数据文件不断增长；错误配置的 TCP 存活探针则只会让一个已挂起但仍在监听的进程继续存活，直到有人注意到它。**就绪探针仍使用 HTTP**，它负责将停滞的 Pod 从 Service 中摘除——存活探针的存在只是为了重启无法自行恢复的进程。

两项时限都源于同一事实：

| 设置项                          | 值    | 原因                                                                                  |
| ------------------------------- | ----- | ------------------------------------------------------------------------------------- |
| `startupProbe.failureThreshold` | `120` | 10 分钟，用于 WAL 重放与冷启动重建；期间就绪探针会拦截流量                            |
| `terminationGracePeriodSeconds` | `300` | 排空后的 WAL 检查点没有超时；健康的 Pod 约 45 秒即可退出                              |

`terminationGracePeriodSeconds` 是**上限，而不是延迟**。`SHUTDOWN_TIMEOUT_MS`（30 秒）只限制请求排空的时间；随后 `closeDbInstance()` 会对 WAL 执行检查点，且该步骤本身没有超时；如果在检查点中途收到 `SIGKILL`，就会把体积庞大的 WAL 带入下一次启动。还需注意它与 `Recreate` 的相互作用：真正挂起的 Pod 会将替换延迟至多 5 分钟。

如需改回 HTTP 存活探针——这在快速本地存储上的小型数据库中是可以接受的，因为此时没有任何单个 SQLite 操作会超过失败阈值，并且 HTTP 能够发现 TCP 无法发现的卡死服务器。请先在自己的卷上通过 `PRAGMA wal_checkpoint(TRUNCATE)` 的耗时进行验证。Kustomize 方式：

```bash
# add deploy/kubernetes/overlays/k8s/liveness-http.yaml to the overlay's patches:
```

Helm 方式：

```bash
--set probes.livenessType=http
```

---

## 5. 升级

```bash
# Kustomize: pin a real tag rather than relying on :latest
kubectl -n omniroute set image deploy/omniroute omniroute=diegosouzapw/omniroute:3.8.51

# Helm
helm upgrade omniroute deploy/helm/omniroute -n omniroute --reuse-values \
  --set image.tag=3.8.51
```

**每次升级都会造成完全停机。** Recreate 会先终止唯一的 Pod，然后再启动其替代 Pod：

1. `preStop` 会休眠 15 秒，使 Service 在收到 SIGTERM 之前摘除端点。
2. 进行中的 SSE 最多排空 `SHUTDOWN_TIMEOUT_MS`（默认 30 秒）。到达正在关闭的进程的新请求会收到带有 `Retry-After` 提示的 `503`。
3. 在新 Pod 就绪之前，端点始终为空——在此期间访问 Ingress 的客户端会收到控制器生成的 `502`，而不是 OmniRoute 的 JSON 响应。

如果可以，请先排空客户端流量。`:latest` 仅在稳定版本发布时才会更新，因此会落后于已合并的修复——对于任何你关心的部署，请固定到 `:X.Y.Z` 或摘要（digest）。

---

## 6. 存储与备份

| 集群         | StorageClass                  | 注意事项                                                          |
| ------------ | ----------------------------- | ----------------------------------------------------------------- |
| k3s          | `local-path`（默认）          | 节点本地存储：Pod 被固定到一个节点上，节点故障时数据随之丢失      |
| k3s 多节点   | Longhorn                      | 可承受节点丢失；仍为 RWO                                          |
| 托管 k8s     | 集群默认值（EBS/PD 等）       | 必须为 RWO 块存储                                                 |

切勿将 `DATA_DIR` 放在 NFS 或 CIFS 上。SQLite 的 WAL 日志在这些文件系统上会损坏。

**卷容量应按遥测数据增长来规划，而不仅仅是配置数据。** 控制平面很小——提供者连接、密钥、组合（combo）只有数百行——但 `conversation_turn_nodes` 和 `agentic_conversations` 目前没有保留策略，会随流量增长（据报告，在智能体负载下约为 190 MB/天）。在 [#12453](https://github.com/diegosouzapw/OmniRoute/issues/12453) 合并之前，请按你的保留窗口来规划 PVC 容量，并在信任此处的 10Gi/20Gi 默认值之前，先观察实际增长情况。

OmniRoute 将数据库写入 `$DATA_DIR/storage.sqlite`，并将自身一致的快照写入 `$DATA_DIR/db_backups/`（`src/lib/db/backup.ts`，默认开启——`DISABLE_SQLITE_AUTO_BACKUP=false`）。请复制这些快照，而不是实时文件：`storage.sqlite` 以 WAL 模式运行，因此在有写入者活动时直接使用 `cp` 可能捕获到损坏的数据库。已发布的镜像不包含 `sqlite3` 命令行工具。

```bash
POD=$(kubectl -n omniroute get pod -l app.kubernetes.io/name=omniroute \
  -o jsonpath='{.items[0].metadata.name}')

kubectl -n omniroute exec "$POD" -- ls -1t /app/data/db_backups | head -5
kubectl -n omniroute cp "omniroute/$POD:/app/data/db_backups" ./omniroute-backups
```

仪表盘在 **Settings → Database backups**（`/api/db-backups`）下提供相同的快照，包括按需创建与恢复。该 API 由路由守卫限制，仅允许回环地址访问，因此请通过仪表盘或端口转发来使用它——它无法通过 Ingress 访问。

Helm PVC 带有 `helm.sh/resource-policy: keep` 注解，因此 `helm uninstall` 会保留数据库。请有意识地手动删除它。

---

## 7. 容量规划

一个 Node 进程对应一个 V8 堆。两个重叠的大型 `/v1/responses` 请求（约 3 MiB / 约 750k tokens）可能会在约 12 GiB 时使堆中止——参见 [#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)。

| 工作负载                 | requests     | limits   | `config.maxOldSpaceSizeMb` |
| ------------------------ | ------------ | -------- | -------------------------- |
| 仪表盘 + 轻量聊天        | 250m / 512Mi | 1 / 2Gi  | 1536                       |
| 默认（Chart）            | 250m / 512Mi | 2 / 4Gi  | 3072                       |
| 编码智能体、大体量 SSE   | 1 / 4Gi      | 4 / 16Gi | 12288                      |

让 `maxOldSpaceSizeMb` **低于**内存限制。如果 V8 的上限超过 cgroup，内核会 OOM 终止 Pod，而不是由 Node 抛出可恢复的堆错误——你会失去该进程以及所有进行中的流，且没有有用的日志。

重量级聊天准入（`src/shared/middleware/chatBodyAdmission.ts`）会根据进程的实际内存上限推导其预算。在调优之前，有两个参数值得了解，因为它们之间的相互作用并不明显：

- **`OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT` 是一个旧版计数上限，只有在你设置它时才会生效。** 未设置时，它实际上等同于无限制，真正起限制作用的是自动推导出的摄入字节预算。设置它（例如设为 `4`）会_启用_计数上限，而不是放宽限制。如果并行的智能体会话遇到 `chat_admission_busy`，那么字节预算才是约束所在，此时增加内存才是有效的手段；添加该变量只会让限制更严格。
- **`OMNIROUTE_CHAT_ADMISSION_QUEUE_MS`** 限制一个重量级请求在返回可重试的 503 之前等待容量的时长。智能体循环会扇出子请求，它们会同时到达闸门，因此较短的等待可以将突发请求串行化，而不是耗尽客户端的重试预算。

除非你已通过测量确认有充分理由，否则请不要改动 `OMNIROUTE_CHAT_ADMISSION_*` 系列的其余变量：在一个已完成容量规划的进程上调高它们，会重新引入堆中止问题。

### 横向扩展

若要同时服务超过约 2 个大型并发任务，请将 Chart 安装 **N 次**：

```bash
helm install omniroute-1 deploy/helm/omniroute -n omniroute \
  --set secrets.existingSecret=omniroute-secrets
helm install omniroute-2 deploy/helm/omniroute -n omniroute \
  --set secrets.existingSecret=omniroute-secrets
```

每个 release 都有自己的 PVC、SQLite 文件和仪表盘。使用任意负载均衡器在其前面进行分发；按 API 密钥做会话保持（sticky）即可满足需要。提供者凭据必须复制到每个实例中，调用日志则按实例分别保存。可选地，可使用 `QUOTA_STORE_DRIVER=redis` 加 `QUOTA_STORE_REDIS_URL` 共享配额计数器——Redis 是共享的计数器存储，而不是共享的 SQLite。

---

## 8. 故障排查

| 现象                                              | 原因                                                                                                                                                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pod 在高负载下重启                                | HTTP 存活探针在繁忙的事件循环上超时。基础清单已使用 TCP——请检查你是否应用了 `liveness-http.yaml` 或 `--set probes.livenessType=http`                                                                                |
| 流式响应在结束时一次性到达                        | Ingress 的响应缓冲已开启                                                                                                                                                                                            |
| 长请求在流中途被截断                              | Ingress 的读取/空闲超时过低                                                                                                                                                                                         |
| 升级后立即出现 `502`                              | 属正常现象：即 Recreate 的端点为空窗口期                                                                                                                                                                            |
| Pod `Pending`，PVC `Pending`                      | 没有默认 StorageClass，或该 StorageClass 不支持 RWO                                                                                                                                                                 |
| `OOMKilled`                                       | `maxOldSpaceSizeMb` ≥ 内存限制                                                                                                                                                                                      |
| 仪表盘实时视图卡住                                | `LIVE_WS_ALLOWED_ORIGINS` 与浏览器来源不匹配，或 `live-ws` 未被路由                                                                                                                                                 |
| 已创建 Ingress 但没有任何路由生效                 | `ingressClassName` 指定了集群中未运行的控制器。使用 `--disable=traefik` 安装的 k3s 没有 `traefik` 类，但 API 服务器仍会接受该对象。请检查 `kubectl get ingressclass`                                                  |
| `database is locked` / 数据损坏                   | 存在两个写入者，或 PVC 位于 NFS/CIFS 上                                                                                                                                                                             |
| 每次重启都比上一次更慢的重启循环                  | 探针在 VACUUM/检查点中途杀掉 Pod，导致 WAL 不断增长。请检查启动时限，并确认存活探针为 TCP                                                                                                                           |

```bash
kubectl -n omniroute describe pod -l app.kubernetes.io/name=omniroute
kubectl -n omniroute logs deploy/omniroute --previous   # after a restart
# The image ships neither wget nor curl — node is the only HTTP client in it.
# healthcheck.mjs is the same probe the Docker HEALTHCHECK uses; exit 0 is healthy.
kubectl -n omniroute exec deploy/omniroute -- node healthcheck.mjs

# Or reach it from your machine, which also exercises the Service:
kubectl -n omniroute port-forward svc/omniroute 20128:20128 &
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:20128/healthz
```
