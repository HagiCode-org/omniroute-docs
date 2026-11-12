---
title: "Entrée Self-Hosted compatible OpenAI"
---

# Entrée unifiée self-hosted compatible OpenAI

Lorsqu'il est activé, le `/v1/chat/completions` existant d'OmniRoute (et le contrat compatible OpenAI qu'il
sert) devient un **gateway self-hosted** : une requête compatible OpenAI en entrée, routée
automatiquement vers le fournisseur de votre choix via les adaptateurs de fournisseurs, avec une
forme d'erreur OpenAI standard en sortie. Le code client ne change pas.

C'est le différenciateur D4 (接入即用) de la conception RIC-697 : le même chemin `/v1` que le SDK
OpenAI cible déjà, adossé à vos propres fournisseurs plutôt qu'à un unique catalogue embarqué.

## Activer

Définissez l'une ou l'autre variable d'environnement (voir `.env.example` pour les deux) :

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — document YAML en ligne (uniquement à l'exécution, non journalisé).
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — chemin vers un fichier YAML.

```yaml
# providers.yaml
providers:
  - id: local
    kind: openai # openai | anthropic | local
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    # apiKey: sk-...       # optional, runtime-only
  - id: claude
    kind: anthropic
    baseUrl: http://127.0.0.1:8080
    model: claude-sonnet
```

Lorsque **l'une ou l'autre** variable est définie, l'entrée unifiée est active pour chaque requête
vers `/v1/chat/completions`. Une configuration présente mais impossible à analyser renvoie `500`
(elle ne retombe jamais silencieusement sur le routage cloud). Lorsqu'aucune n'est définie, la
route se comporte exactement comme avant.

## Routage automatique du fournisseur

Priorité (déterministe, sans modèle prédictif) :

1. En-tête `x-omniroute-provider: <id>` — identifiant de fournisseur exact.
2. Préfixe de `model` : `provider/model` (barre oblique) ou `provider::model` (double deux-points).
3. Premier fournisseur configuré.

Le préfixe de routage est retiré avant la transmission — l'upstream reçoit le modèle nu
(`claude-sonnet`, et non `claude/claude-sonnet`).

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## Squelette d'authentification (D5 réservé)

`OMNIROUTE_SELF_HOSTED_API_KEY` facultatif. Lorsqu'il est défini, les requêtes doivent porter
`Authorization: Bearer <key>`. Non défini = route ouverte (loopback / réseau de confiance), à
l'image du fonctionnement des fournisseurs locaux existants d'OmniRoute. Le système de clés
quota/quota-自治 de D5 devrait reprendre cet en-tête.

## Contrat d'échec

- Le corps d'une réponse upstream non 2xx est normalisé via `parseUpstreamError` + `buildErrorBody`
  dans la forme d'`error` OpenAI standard (Hard Rule #12 — jamais de texte upstream brut).
- Les échecs au niveau réseau (connexion refusée / DNS / TLS) renvoient un `502` normalisé avec
  `error.message: "Upstream provider unreachable: …"`.
- Les en-têtes d'identifiants / de session renvoyés en écho par l'upstream sont supprimés de chaque
  réponse.

## Tests

`tests/unit/self-hosted-entry.test.ts` couvre la sélection du fournisseur, la transmission du
préfixe de modèle, l'hygiène des en-têtes, l'authentification, la normalisation des erreurs
upstream, le passthrough du streaming SSE et les chemins de repli / de mauvaise configuration —
le tout via du vrai HTTP contre un upstream local.

## Notes

- Les modèles self-hosted contournent par conception le mécanisme cloud de retrait / d'alias : la
  bifurcation a lieu avant ces vérifications cloud, de sorte que des ID comme `local/llama3`
  n'activent jamais les 410 de pairs cloud ni les réécritures d'alias.
- Les stratégies de routage déterministes (fallback / cooldown / coût / latence / blacklist)
  relèvent du périmètre de M2 (`RIC-740`) et s'injectent ici dans la couche gateway. Configurez-les
  avec un bloc `strategy:` — voir [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md).
