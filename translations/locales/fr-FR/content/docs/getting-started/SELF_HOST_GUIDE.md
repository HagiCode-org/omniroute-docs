---
title: "🚀 Guide Self-Host — OmniRoute (零月费自托管 / zero-fee self-host)"
version: 3.8.51
lastUpdated: 2026-09-14
---

# 🚀 Guide Self-Host — OmniRoute

> **TL;DR** — trois commandes, un endpoint local, zéro frais mensuels. Pas de
> facturation SaaS, pas d'isolation multi-tenant, pas de saut hébergé de
> traitement des prompts. Vos prompts vont directement au fournisseur que vous
> choisissez.

```bash
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

Voici le **vecteur self-host** de la forme de produit « 零月费 + 自托管 » d'OmniRoute :
un conteneur/binaire packagé que vous exécutez sur votre propre machine en 5 minutes.

---

## Pourquoi ce guide existe

OmniRoute fournit un `docker-compose.yml` sophistiqué avec des profiles
(`base`, `web`, `cli`, `host`, `cliproxyapi`, `memory`, `bifrost`). Chaque service
applicatif est conditionné par un profile, donc un simple `docker compose up -d`
ne démarre que Redis. C'est correct pour les utilisateurs avancés qui choisissent
un profile — mais ce n'est *pas* une histoire de self-host en 5 minutes.

`docker-compose.selfhost.yml` est l'overlay KISS : **une seule commande, image
publiée, loopback uniquement, Redis inclus, aucun choix de profile, aucune étape
de build.** Quand il ne vous suffit plus, passez aux profiles complets du
[DOCKER_GUIDE](../guides/DOCKER_GUIDE.md).

| Public | Commencer ici | Passer à |
| --- | --- | --- |
| Utilisateur self-host, mono-utilisateur | ce guide | — |
| Utilisateur avancé, outils CLI / fournisseurs web-cookie / sidecars | — | profiles de `docker-compose.yml` |

---

## Prérequis

- Docker Engine 24+ (ou Docker Desktop 4.30+) avec le plugin Compose v2.
- ~2 Go de RAM libres (voir [Dimensionnement](#dimensionnement-du-conteneur)).
- Une clé API de fournisseur auprès de n'importe quel fournisseur pris en charge (OpenAI, Anthropic, Google,
  ou l'un des [150+ niveaux gratuits](./FREE-TIERS-GUIDE.md)).

Aucune toolchain de build, aucun Node, aucun git clone requis — l'image est téléchargée.

---

## Étape 1 — Configurer (1 min)

```bash
cp .env.selfhost.example .env
```

Modifiez exactement **deux** lignes dans `.env` :

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true` impose une clé API / une connexion pour chaque requête `/v1`
et pour le dashboard. Au premier démarrage, le dashboard génère automatiquement un
`INITIAL_PASSWORD` — lisez-le dans les logs :

```bash
docker logs omniroute | grep -i password
```

Les autres variables (`DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT`,
`OMNIROUTE_MEMORY_MB`) ont déjà des valeurs par défaut raisonnables. Laissez-les
telles quelles sauf si vous savez que vous devez les changer.

---

## Étape 2 — Démarrer (1 min)

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Télécharge `diegosouzapw/omniroute:latest` (multi-arch AMD64 + ARM64, ~250 Mo) et
`redis:8.6.5-alpine`, démarre les deux, et attend que Redis soit sain avant que
l'application ne démarre.

### Étape 3 — Vérifier (30 s)

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

Vous devriez voir `{"status":"ok"}` et `healthy`. Ouvrez ensuite le dashboard :

```
http://127.0.0.1:20128
```

Dans les ~300 s suivant `up -d`, l'endpoint est joignable localement et le
healthcheck est `healthy` — le critère d'acceptation du ticket self-host.

---

## Ports

| Port | Rôle | Liaison par défaut |
| --- | --- | --- |
| `20128` | Dashboard + proxy LLM `/v1` (point d'entrée unifié) | `127.0.0.1` |
| `20129` | Port API (serveur à serveur) | `127.0.0.1` |
| `20132` | WebSocket en direct (mises à jour du dashboard en temps réel) | `127.0.0.1` |

Les trois ports sont liés **uniquement à loopback** par défaut. Redis n'est **pas**
publié sur l'hôte du tout — l'application l'atteint via le réseau compose. C'est
délibéré : exposer un Redis non authentifié sur `0.0.0.0` est un piège.

---

## Connecter un fournisseur

1. Ouvrez le dashboard → **Providers**.
2. Ajoutez un fournisseur et collez sa clé API. Les clés sont chiffrées au repos
   avec AES-256-GCM ; le texte en clair ne quitte jamais votre machine.
3. Pointez votre IDE / agent vers le point d'entrée unifié :

```
http://127.0.0.1:20128/v1
```

Pour le choix du fournisseur, consultez le
[Guide des niveaux gratuits](./FREE-TIERS-GUIDE.md) — OmniRoute agrège 150+ niveaux
gratuits dans un seul endpoint, ce qui vous permet d'utiliser `model: "auto"` pour
choisir la meilleure option gratuite à chaque requête.

---

## Dimensionnement du conteneur

L'image fixe `OMNIROUTE_MEMORY_MB=1024`. C'est suffisant pour le dashboard
et un chat léger. Les **coding agents** (`POST /v1/responses` depuis Claude Code,
Codex, Grok, …) conservent plusieurs grands graphes de contexte pendant la compression et
peuvent faire avorter V8 à ~12 GiB d'old-space avec deux longs contextes qui se chevauchent
([#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)).

`.env.selfhost.example` utilise par défaut `OMNIROUTE_MEMORY_MB=2048` — un plancher
sûr pour un utilisateur seul exécutant des coding agents. Augmentez-le si vous répartissez
de nombreux modèles en parallèle (combos fusion) ou si vous rencontrez `FATAL ERROR: Reached heap limit` :

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

La mémoire est un plafond de heap V8 ; les buffers natifs (SQLite, ONNX, better-sqlite3)
se situent en dehors, donc dimensionnez le conteneur quelques centaines de Mo au-dessus du heap.

---

## Build binaire local (optionnel)

Vous préférez un binaire à Docker ? Le paquet npm contient le même code :

```bash
npm install -g omniroute
omniroute
```

Cela exécute directement le serveur standalone Next.js sur votre hôte — mêmes ports,
même `DATA_DIR` (`./data` par défaut). Utilisez-le lorsque vous ne pouvez pas exécuter Docker
(par ex. une VM verrouillée). Le chemin conteneur ci-dessus est la valeur par défaut recommandée
car il embarque exactement le runtime avec lequel l'image a été testée.

Depuis les sources (développement uniquement — pas un chemin de déploiement) :

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## Exposition au-delà de localhost

Ne **basculez pas** `APP_BIND_HOST=0.0.0.0` tant que `REQUIRE_API_KEY=false`. Cela
publie un proxy `/v1` ouvert sur chaque interface LAN/WAN — n'importe qui sur le
réseau peut consommer vos quotas de fournisseur. L'ordre est fixe :

1. Définissez `REQUIRE_API_KEY=true` dans `.env`.
2. Lisez `INITIAL_PASSWORD` dans les logs et connectez-vous.
3. *Seulement ensuite*, définissez `APP_BIND_HOST=0.0.0.0` (ou placez devant un reverse
   proxy imposant l'authentification et gardez loopback).

Pour le TLS / un domaine, exécutez Caddy ou Traefik devant et laissez `APP_BIND_HOST`
à `127.0.0.1`. Consultez les sections
[DOCKER_GUIDE — Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls)
et
[Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel)
pour des configs de reverse proxy à copier-coller.

---

## Données, sauvegardes et réinitialisations

- **Répertoire de données** : `./data` (monté par bind sur `/app/data`). Toutes les bases SQLite,
  les migrations, la piste d'audit et les clés de fournisseur chiffrées s'y trouvent.
- **Sauvegardes** : la sauvegarde automatique SQLite est activée par défaut
  (`DISABLE_SQLITE_AUTO_BACKUP` n'est pas défini → activée). Pour un instantané manuel :
  ```bash
  ./bin/snapshot-data.sh
  ```
  Restaurez avec `./bin/restore-data.sh`.
- **Réinitialiser le mot de passe du dashboard** :
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **Réinitialiser les politiques** (routage/failover/quota aux valeurs d'usine) :
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## Problèmes courants

<details>
<summary><code>docker compose up</code> ne démarre que Redis</summary>

Vous exécutez le `docker-compose.yml` **complet**, dont les services applicatifs
sont conditionnés par un profile. Pour le chemin en une commande, utilisez le fichier self-host :

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Ou, avec le compose complet, choisissez un profile :
`docker compose --profile base up -d`.
</details>

<details>
<summary>Le healthcheck reste <code>starting</code> / <code>unhealthy</code></summary>

- Vérifiez que Redis est démarré : `docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- Vérifiez les logs de l'application : `docker logs omniroute`
- Le healthcheck sonde `/healthz` et autorise une période de démarrage de 20 s. Un premier
  démarrage lent (migrations à froid) peut prendre plus de temps — augmentez `start_period` dans le
  fichier compose si votre disque est lent.
</details>

<details>
<summary><code>FATAL ERROR: Reached heap limit</code> sous coding agents</summary>

Augmentez `OMNIROUTE_MEMORY_MB` dans `.env` (par ex. `4096`), puis
`docker compose -f docker-compose.selfhost.yml up -d`. Voir
[Dimensionnement du conteneur](#dimensionnement-du-conteneur).
</details>

<details>
<summary>Les fournisseurs web-cookie (Gemini Web, Claude Turnstile) échouent avec
<code>Executable doesn't exist at .../ms-playwright/chromium</code></summary>

L'image `base` est livrée sans Chromium. Le compose self-host utilise l'image
`base` publiée. Pour les fournisseurs web-cookie, passez au compose complet
avec le profile `web` (qui embarque Playwright/Chromium) :

```bash
docker compose --profile web up -d
```

Voir [DOCKER_GUIDE — Available Profiles](../guides/DOCKER_GUIDE.md#available-profiles).
</details>

<details>
<summary>Le port 20128 est déjà utilisé</summary>

Définissez `DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT` dans `.env` sur des ports libres et
relancez `up -d`.
</details>

---

## Ce que ceci n'est volontairement PAS

Conformément à la contrainte KISS du self-host, ce chemin n'inclut **pas** :

- ❌ Facturation SaaS / mesure d'usage / niveaux de forfait
- ❌ Isolation multi-tenant / espaces de noms par tenant
- ❌ Un saut hébergé de traitement des prompts (vos prompts vont directement au fournisseur)
- ❌ Tout identifiant ou secret intégré

C'est un vecteur **de pur self-host local** — la chose la plus simple qui rende réelle la promesse
« 零月费 + 自托管 ».

---

## Checklist de sécurité (self-host)

Avant d'exposer au-delà de loopback :

- [ ] `REQUIRE_API_KEY=true` dans `.env`
- [ ] `INITIAL_PASSWORD` remplacé par une valeur forte et unique
- [ ] `APP_BIND_HOST` laissé à `127.0.0.1` *sauf* derrière un proxy imposant l'authentification
- [ ] TLS terminé par Caddy/Traefik/Cloudflare devant (jamais de HTTP simple sur WAN)
- [ ] Redis non publié sur l'hôte (le compose self-host l'impose déjà)
- [ ] Volume `./data` sauvegardé régulièrement (`bin/snapshot-data.sh`)
- [ ] Clés de fournisseur renouvelées selon la politique propre au fournisseur

Pour la dimension complète d'audit de la chaîne d'approvisionnement / des images / des dépendances, consultez
[SECURITY.md](../../SECURITY.md) et
[SUPPLY_CHAIN](../security/SUPPLY_CHAIN.md).

---

## Voir aussi

- [Guide Docker](../guides/DOCKER_GUIDE.md) — profiles, Caddy HTTPS, tunnels, tags d'image
- [Démarrage rapide](./QUICK-START.md) — parcours en 3 minutes pour les nouveaux utilisateurs
- [Guide des niveaux gratuits](./FREE-TIERS-GUIDE.md) — 150+ niveaux gratuits de fournisseurs
- [Guide des fournisseurs](./PROVIDERS-GUIDE.md) — connecter et configurer les fournisseurs
- [Dépannage](../guides/TROUBLESHOOTING.md) — résolution approfondie des problèmes
