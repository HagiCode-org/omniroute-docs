---
title: "Catalogue de modèles du CLI et métadonnées manuelles"
version: "3.8.51"
lastUpdated: "2026-09-21"
---

# Catalogue de modèles du CLI et métadonnées manuelles

`omniroute models` lit d'abord le catalogue public de modèles du serveur sélectionné, y compris
ses entrées personnalisées et synchronisées. `--output json` et `--output jsonl` renvoient toutes
les lignes correspondantes, sans message de troncature de tableau. Les tableaux interactifs
affichent au plus 50 lignes. Le JSON conserve les limites de contexte publiques, les modalités,
les capacités, la source du modèle lorsque le serveur la fournit et les métadonnées de format
d'API ; les identifiants et les en-têtes de compatibilité ne sont pas produits en sortie. Un
fallback hérité vers `/api/models` n'est utilisé que lorsque l'endpoint public renvoie HTTP 404,
405 ou 501, jamais après un échec d'authentification. `omniroute completion refresh` utilise ce
même catalogue. Une requête de catalogue de modèles en échec renvoie un code de sortie non nul et
conserve le cache de complétion précédent. Les scripts de complétion Bash, Zsh et Fish
annoncent les sous-commandes de modèles manuels.

## Cycle de vie des modèles manuels

Ces opérations utilisent l'API de gestion authentifiée existante `/api/provider-models`. Elles
respectent la même sélection globale `--context` et `--base-url` que les autres commandes du CLI.
Utilisez séparément l'ID canonique du fournisseur et l'ID de modèle du fournisseur ; un ID de
modèle contenant des barres obliques est valide. Utilisez un contexte de gestion configuré plutôt
que de placer des identifiants dans les arguments de la commande.

```bash
omniroute models openai --output json
omniroute models manual openai
omniroute models add openai my-model --name "My model" --context-window 32768 --dry-run
omniroute models add openai my-model --name "My model" --context-window 32768
omniroute models edit openai my-model --context-window 65536
omniroute models edit openai my-model --clear-context-window
omniroute models remove openai my-model --dry-run
omniroute models remove openai my-model --yes
```

Les exemples décrivent la syntaxe ; remplacez les ID de fournisseur et de modèle par des entrées
appartenant à votre serveur. L'opération d'ajout ne crée pas de connexion de fournisseur.

- `add` refuse une entrée personnalisée existante. L'option facultative `--max-output-tokens`
  définit la limite de sortie à la création ; `--api-format` définit le format d'API du modèle et
  les métadonnées d'endpoint correspondantes, par exemple `embeddings` plutôt que `chat`.
- `edit` exige une entrée manuelle existante. Sa limite de contexte utilise le remplacement
  manuel de contexte indépendant du backend ; l'effacer supprime ce remplacement, et non la
  limite d'entrée d'origine ni les métadonnées synchronisées.
- `remove` exige `--yes`, sauf avec `--dry-run`. Il demande `resetOverride=true`, ce qui
  préserve une entrée synchronisée portant le même ID. La suppression en masse n'est pas exposée.
- `--dry-run` effectue la lecture préalable authentifiée, mais aucune écriture ni inférence.
- Chaque mutation effective relit ensuite le catalogue manuel. `persistenceVerified: true`
  signifie que les métadonnées demandées ont été observées après l'écriture ; cela ne signifie pas
  que le modèle peut générer du texte ou appeler des outils. `inferenceValidation` vaut toujours
  `not-run`.
- Un échec de readback renvoie un code de sortie non nul. L'écriture a pu déjà prendre effet ;
  inspectez le serveur avant de réessayer. Les écritures concurrentes ne sont pas sérialisées par
  ce CLI, et l'API existante ne fournit pas de transaction compare-and-swap.

## Test & Add : non implémenté

Les entrées manuelles ne sont pas vérifiées. Il n'existe pas d'option `--validate`, et ces
commandes n'émettent aucune requête d'inférence et n'exécutent aucun outil. Un futur flux de
validation opt-in devra séparer les identifiants d'inférence de l'authentification de gestion et
établir quelle connexion de fournisseur exacte a produit les trois preuves : la génération, un
appel d'outil synthétique lié à un nonce, et la poursuite après un résultat d'outil synthétique.
Aucune exécution réelle d'outil n'est nécessaire pour ces preuves.

L'épinglage `x-omniroute-connection` existant ne suffit pas à lui seul comme receipt de preuve :
la sélection des identifiants peut volontairement libérer un épinglage en cas de cooldown, de
quota ou de compte exclu, et l'affinité de session participe à la sélection. Voir
`src/sse/services/auth.ts` et la gestion de `forcedConnectionId` dans
`src/sse/handlers/chat.ts`. Avant d'implémenter Test & Add, il faut décider d'un contrat
d'épinglage strict ou de receipt de connexion vérifiable. Les tests devront ensuite prouver
l'absence de persistance après toute réponse en échec, tronquée, expirée ou provenant d'une
mauvaise connexion. Il s'agit d'une décision de contrat backend distincte, et non d'une promesse
faite par le CRUD manuel.
