---
title: "构建警告参考"
version: 3.8.52
lastUpdated: 2026-10-18
---

# 构建警告参考

`npm run build` 和 `npm run build:release` 会输出一些**预期内**的警告，它们并不意味着构建产物已损坏。本页对这些警告进行了归类，说明每一条是否需要处理，并指向负责它的代码，以便操作者能够区分已知的构建期噪声与真正的回归。

如果你看到的消息不在本页列出，请将其视为新问题并进行排查。

## Webpack 针对 `open-sse/executors/codex.ts` 的 "Critical dependency" 警告

```
./open-sse/executors/codex.ts
Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
```

**预期内，有意为之。** `open-sse/executors/codex/wreqLoader.ts` 通过 `createRequire()` 返回的函数加载可选的 `wreq-js` 原生辅助模块，其中的模块说明符被刻意保留为**变量**（`Reflect.apply(requireFn, undefined, [moduleName])`）。字面量形式的说明符会被 Turbopack 静态改写为带哈希的、相对于 `.next` 的 require，而该路径在独立的 Docker 运行时中并不存在，因此必须使用动态形式（#12491）。该警告是这一模式的代价；模块在运行时仍可正常解析，并非缺失依赖。

由于该加载器被 Codex 配额服务、instrumentation 模块以及内部 Codex WebSocket 路由导入，webpack 会针对每条导入路径各报告一次相同的警告。

## Fumadocs MDX 的 "build dependencies" 缓存警告

```
[webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo] Parsing of
.../fumadocs-mdx/dist/eval-*.js for build dependencies failed at 'import(pathToFileURL(outfile).href)'.
Build dependencies behind this expression are ignored and might cause incorrect cache invalidation.
```

**属于上游 `fumadocs-mdx`，无需处理。** 该包会发出一个对生成模块的动态 `import()`，而 webpack 的 `FileSystemInfo` 阶段无法对其进行静态追踪。唯一的后果是，webpack 可能会更频繁地为该依赖失效其构建缓存；**产出内容不受影响**。OmniRoute 通过 `scripts/build/knownBuildWarnings.mjs` 在 `next.config.mjs` 中屏蔽了这一已知的无害形式，该脚本将整个 `node_modules/fumadocs-mdx/dist/` 目录列入白名单（包括 `load-from-file-*.js` 和 `eval-*.js` 两类打包文件）。

## 静态生成期间的运行时配置消息

`next build` 在收集页面数据时会导入应用模块，因此构建期间也会出现一些面向运行时的日志行。它们**不是**构建错误。

| 消息                                                                                          | 所属模块                              | 含义                                                                                                                                             |
| --------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `[DB] Build phase detected — using no-op SQLite stub (never queried)`                         | `src/lib/db/core.ts`                  | 构建从不打开真实数据库。属于预期。                                                                                                               |
| `[REDIS] REDIS_URL is not set in production. Using in-memory rate limiting.`                  | `src/shared/utils/rateLimiter.ts`     | Redis 是可选的；未设置时，限流会回退为内存实现。仅当你在生产环境中运行 Redis 时才需设置它，参见 `REDIS_PRODUCTION_CONFIG.md`。                    |
| `[CREDENTIALS] No external credentials file found, using defaults.`                           | `open-sse/config/credentialLoader.ts` | 除非你提供了外部凭据文件，否则属于预期。                                                                                                         |
| `[INFO] [PLUGIN_SCANNER] scanner.dir_resolved` / `[INFO] [MEMORY_MANAGER] Registered backend` | 插件与内存注册表                      | 信息性日志。                                                                                                                                     |

### `[SECURITY] FATAL: JWT_SECRET is not set`

`JWT_SECRET` 是**运行时必需的**，缺少它时登录会直接失败（fail closed），仪表盘也将无法访问。请在启动服务器之前在环境中设置它（参见 `../reference/ENVIRONMENT.md`）。

在 `next build` 期间，过去在没有 `JWT_SECRET` 的情况下收集页面数据时会导入登录路由模块，并打印同样的 `FATAL` 行，看起来像是正在发生的安全故障。现在该消息在构建阶段会被跳过：`src/app/api/auth/login/route.ts` 中模块级别的警告由 `isNextBuildPhase()`（`src/lib/buildPhase.ts`）控制，该函数匹配 `NEXT_PHASE=phase-production-build`、`OMNIROUTE_BUILDING=1` 和 `npm_lifecycle_event=build`。在运行时缺少密钥时，请求处理程序仍会返回 `500`，因此运行时行为保持不变。

## Bun 与依赖安装

OmniRoute 使用 **Node.js** 构建和运行（参见 `package.json` 中的 `engines.node`）。请使用 `npm ci`（或 `npm install`）安装依赖：

```bash
npm ci
npm run build:release
```

在本分支中，**`bun install` 不是受支持的 OmniRoute 依赖安装方式**。Bun `1.4.2` 作为 devDependency 被固定版本，仅用于运行一小组经过白名单许可的门禁/生成器脚本。如果你使用 Bun 安装，可能会看到：

- `warn: Bun currently only supports one level of nested "overrides"`：Bun 对 `package.json` 中 `overrides` 的支持比 npm 更浅，npm 会应用完整的依赖树。
- **被阻止的生命周期脚本**：原生包（ONNX Runtime、Playwright Chromium、SWC、protobufjs、Parcel Watcher、unrs-resolver）。Bun 默认会阻止安装脚本；受支持的 `npm ci` 路径会运行这些脚本，之后 `npm run check:native-deps` 会验证每个外部化包都能正常解析。

### Bun 脚本运行器失败

Bun 只运行经过白名单许可的门禁/生成器脚本（`check:provider-consistency`、`check:compression-budget`、`check:known-symbols`、`gen:provider-reference`、`bench:compression`），以及 `test:bun:db` 冒烟测试套件，参见 `AGENTS.md` → Environment。拉取锁文件变更后，请运行 `npm install`，以便 `bun` 能在本地解析（过期的 `node_modules` 会使这些脚本以 `bun: not found` 失败）。

**Bun 的两种不同失败，对应两种不同修复方法，请勿混淆。**

- **（a）`bun: not found`** → 依赖树已过期；运行 `npm install`。
- **（b）Bun 存在但拒绝运行** → `node_modules/bun/bin/bun.exe` 仍是该包自带的约 450 字节 **bash 占位文件**，原因是其 `postinstall` 被跳过了（`npm install --ignore-scripts`，或会跳过生命周期脚本的包管理器）。真正的二进制文件已经存在于平台包中（例如 `node_modules/@oven/bun-windows-x64/bin/bun.exe`，约 86 MB），因此并没有缺失任何文件，在依赖已满足的树上重新运行 `npm install` 也可能无法修复。修复方法：`cd node_modules/bun && node install.js`。

**在 Windows 上，该错误具有明显的误导性**：`cmd.exe` 会要求加载器运行一个 bash 脚本，它会报告 `This version of … is not compatible with the version of Windows you're running`，这看起来像是操作系统或架构问题，但实际含义是“这不是一个 Windows 可执行文件”。请使用 `ls -l node_modules/bun/bin/bun.exe` 确认真正的原因（几百字节即为占位文件）。无论哪种情况，`node --import tsx <script>` 都是经过验证、输出与之逐字节一致的回退方案，适用于全部四个脚本。
