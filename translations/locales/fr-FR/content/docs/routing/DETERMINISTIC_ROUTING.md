---
title: "Stratégies de routage déterministe"
---

# Stratégies de routage déterministe

L'entrée gateway self-hosted d'OmniRoute (`/v1/chat/completions`, RIC-738) route vers un
seul fournisseur par défaut. Lorsque vous configurez un bloc `strategy:`, la décision de
routage devient une **politique déterministe et explicable** — le différenciateur
d'OmniRoute face au routage en boîte noire "predict" de NotDiamond/Martian.

Chaque décision est :

- **Déterministe** — la même config et le même état d'exécution produisent le même fournisseur.
- **Exprimée en config** — une règle par ligne ; pas de "一体化智能体", pas de modèle appris.
- **Explicable** — chaque réponse porte `x-omniroute-route-decision`, une réponse en une
  ligne à "pourquoi ce modèle ?" (et "pourquoi PAS celui-là").

Il s'agit de M2 de la différenciation RIC-697 (D3 可审计路由). Il n'y a **aucune dépendance
prédictive / ML** — les stratégies sont de pures règles sur des signaux observables
(échecs consécutifs, coût déclaré, latence mesurée).

## Activer

Ajoutez un bloc `strategy:` dans le même document YAML que `providers:`, ou faites pointer
`OMNIROUTE_SELF_HOSTED_STRATEGY` (YAML en ligne) / `OMNIROUTE_SELF_HOSTED_STRATEGY_FILE`
(un fichier) vers un document `strategy:` autonome. Une stratégie explicite définie par
variable d'environnement est fusionnée par-dessus le bloc en ligne, clé par clé.

```yaml
# providers.yaml
providers:
  - id: cheap
    kind: openai
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    costPer1MInput: 0.2 # USD per 1M input tokens — used by cost-priority
  - id: fast
    kind: openai
    baseUrl: http://127.0.0.1:8080/v1
    model: gpt-4o-mini
    costPer1MInput: 0.6
  - id: premium
    kind: anthropic
    baseUrl: http://127.0.0.1:8081
    model: claude-sonnet
    costPer1MInput: 3.0

strategy:
  blacklist: [] # provider ids never used
  whitelist: [cheap, fast, premium] # when non-empty, ONLY these are used
  costPriority: true # cheapest eligible candidate first
  latencyAware:
    enabled: true # fastest recent-average candidate first
  cooldown:
    consecutiveFailures: 2 # breaker trips after this many in a row
    cooldownMs: 30000 # …and the provider stays excluded this long
  fallbackChain: [cheap, fast, premium] # explicit fallback order
```

## Les cinq stratégies

| Stratégie        | Config                                        | Effet                                                                                                  |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Blacklist        | `blacklist: [id, ...]`                        | Les fournisseurs listés ne sont jamais candidats.                                                      |
| Whitelist        | `whitelist: [id, ...]`                        | Non vide → seuls les fournisseurs listés sont candidats.                                               |
| Cooldown/breaker | `cooldown: {consecutiveFailures, cooldownMs}` | Après N échecs consécutifs, un fournisseur est exclu pendant la fenêtre. Un succès réinitialise le compteur. |
| Priorité au coût | `costPriority: true`                          | Les candidats éligibles sont triés par `costPer1MInput` croissant (déclaré, jamais inventé).           |
| Sensible à la latence | `latencyAware.enabled: true`             | Les candidats éligibles sont triés par latence moyenne récente des requêtes croissante. Les fournisseurs sans échantillon passent en dernier. |
| Chaîne de fallback | `fallbackChain: [id, ...]`                  | Ordre explicite principal→secours. Prévaut sur l'ordre par coût/latence.                               |

Les filtres (blacklist / whitelist / cooldown) s'exécutent en premier et retirent des
candidats. Ensuite, l'étape d'ordonnancement trie les survivants : un `fallbackChain`
explicite prévaut ; sinon `costPriority` puis `latencyAware` s'appliquent dans cet ordre.

## Fournisseurs épinglés

L'en-tête `x-omniroute-provider` et le préfixe de modèle `provider/model` sont des
**épinglages explicites**, pas des préférences. Si un fournisseur épinglé est exclu par un
filtre strict (blacklist / whitelist / cooldown actif), la requête échoue avec `400` et la
raison de l'épinglage — le gateway ne redirige jamais silencieusement un client qui a
demandé un fournisseur précis. Si l'épinglage survit aux filtres, il est le premier
candidat, et les autres candidats servent de chaîne de fallback.

## Fallback en cas d'échec

La liste ordonnée des candidats est la chaîne de fallback. Lorsque le premier fournisseur
échoue (réseau inaccessible, connexion refusée, DNS/TLS, ou toute réponse non 2xx), le
gateway passe au candidat suivant, et ainsi de suite. Chaque échec est enregistré dans le
breaker de cooldown et chaque tentative est échantillonnée en latence — un
fournisseur principal défaillant entre donc aussi en cooldown pour les requêtes
_suivantes_. Lorsque tous les candidats échouent, la dernière erreur normalisée (format
OpenAI) est renvoyée. Lorsqu'aucun candidat n'est éligible, un `503` accompagné de la
décision explicable complète est renvoyé.

## Explicabilité

Chaque réponse routée par le moteur de stratégie porte :

```
x-omniroute-route-decision: cheap(cost-priority: cheap #1) -> fast(cost-priority: fast #2); premium excluded: blacklist: premium forbidden
```

La valeur est la liste ordonnée des candidats plus chaque raison d'exclusion — la piste
d'audit pour "pourquoi ce modèle, pourquoi pas celui-là".

## Contrat d'échec (inchangé depuis RIC-738)

- Le corps non 2xx de l'upstream est normalisé via `parseUpstreamError` + `buildErrorBody`
  vers la forme `error` standard d'OpenAI (Hard Rule #12).
- Les échecs au niveau réseau renvoient un `502` normalisé ; une fois toute la chaîne
  épuisée, la dernière erreur normalisée est remontée.
- Les en-têtes d'identifiants / de session renvoyés en écho par l'upstream sont retirés de
  chaque réponse.
- Une config de fournisseur avec un bloc `strategy:` mal formé renvoie `500` — une politique
  mal configurée ne devient jamais silencieusement un no-op.

## Tests

- `tests/unit/routing-strategies.test.ts` — 25 tests unitaires sur le moteur de stratégie
  pur : parsing, blacklist/whitelist, breaker de cooldown, priorité au coût,
  sensibilité à la latence, chaîne de fallback, pipeline combiné, explicabilité.
- `tests/unit/self-hosted-entry.test.ts` — injection de fautes sur du vrai HTTP : principal
  en panne → le fallback réussit ; tous en panne → dernière erreur ; épinglé-blacklisté →
  400 ; le cooldown exclut un fournisseur défaillant à la requête suivante ; aucun éligible →
  503 avec décision explicable.
