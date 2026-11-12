---
title: "Posture d'authentification de l'inférence"
---

# Posture d'authentification de l'inférence

## Vue d'ensemble

`GET /v1/models` et les endpoints d'inférence sont contrôlés par des **paramètres différents**.
La probe la plus naturelle qu'un opérateur lance pour répondre à "mon API est-elle protégée ?"
peut donc renvoyer une mauvaise réponse.

| Endpoint                                                                           | Contrôlé par                                                                                                                                         |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/models`                                                                   | La posture de connexion au dashboard — `isAuthRequired()`, remplaçable par instance avec `requireAuthForModels` (`src/app/api/v1/models/catalogRequest.ts`) |
| `POST /v1/chat/completions`, `POST /v1/responses`, et les autres routes d'API client | `REQUIRE_API_KEY` (`src/server/authz/policies/clientApi.ts`)                                                                                         |

Sur une instance dont un mot de passe administrateur est défini et où `REQUIRE_API_KEY=false`,
`/v1/models` répond `401` alors que l'inférence est ouverte à quiconque peut atteindre le port.

> **Mise en garde sur les probes :** un `401` de `/v1/models` ne vérifie **pas** que l'inférence
> est protégée. Il indique seulement que le dashboard exige une connexion.

Ce n'est pas hypothétique. Dans la discussion #13310, une instance self-hosted derrière Traefik a
vu son quota Codex consommé par du trafic anonyme `POST /v1/responses` alors que `/v1/models`
renvoyait `401` — ce qui, selon les mots de l'auteur du signalement, "a d'abord donné l'impression
que toute l'API était protégée" et l'a conduit à examiner le mauvais composant.

## Comment vérifier réellement

Faites une probe sur une route d'inférence, et non sur le catalogue :

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST http://<host>:<api-port>/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<any-model>","messages":[{"role":"user","content":"ping"}]}'
```

Un `401` signifie que `REQUIRE_API_KEY` est appliqué. Toute réponse qui atteint le routage
(y compris une erreur de modèle introuvable) signifie que le trafic anonyme est accepté.

Notez qu'avec `REQUIRE_API_KEY=false`, un bearer **invalide** se dégrade en accès anonyme au lieu
d'être rejeté (#2257) ; envoyer une clé bidon n'est donc pas non plus une probe valable.

## Avertissement au démarrage

Lorsque `REQUIRE_API_KEY` est désactivé et qu'un serveur se lie à une interface non loopback,
OmniRoute journalise un avertissement au démarrage (`src/lib/startup/nonLoopbackApiKeyGuard.ts`).
Cela couvre trois surfaces :

- le serveur Dashboard/API qui sert l'inférence `/v1` — `HOST`, `0.0.0.0` par défaut
- le pont API — `API_HOST`, `127.0.0.1` par défaut
- le WebSocket du dashboard en direct — son propre hôte

L'avertissement ne bloque jamais le démarrage : un reverse proxy placé devant OmniRoute applique
peut-être déjà sa propre authentification.

## Voir aussi

- `REQUIRE_API_KEY` dans [ENVIRONMENT.md](../reference/ENVIRONMENT.md)
- `APP_BIND_HOST` et les valeurs par défaut loopback de compose (#12568)
- #2257 — un bearer invalide se dégrade en accès anonyme lorsque `REQUIRE_API_KEY` est désactivé
- #13695 — ce document
