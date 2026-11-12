---
title: Smoke tests CLI isolés
description: Validez les contrats de protocole des CLI installés avec des réponses locales jetables.
version: "3.8.51"
lastUpdated: "2026-09-22"
---

# Smoke tests CLI isolés

Exécutez le harness facultatif sur des binaires Aider, Goose, OpenCode, Qwen Code ou Codex déjà
installés :

```bash
node scripts/cli/smoke-cli-integrations.mjs --targets qwen,codex --json
```

`--bin-dir /absolute/path` ajoute en tête un répertoire de binaires existant. Le harness
n'installe aucun outil. Les exécutables manquants produisent `HOLD-missing-binary` ; un délai
dépassé produit `HOLD-timeout`. Tout FAIL fait quitter le processus avec le code 1 ; un HOLD le
fait quitter avec le code 2. Toutes les cibles doivent obtenir PASS pour un code de sortie 0.

Chaque cible s'exécute via `omniroute run` contre un serveur HTTP jetable lié à `127.0.0.1`, en
utilisant un identifiant sentinel fixe et non secret. HOME, les répertoires XDG, les répertoires
de configuration des CLI et le répertoire de données d'OmniRoute sont temporaires. Les
identifiants de fournisseur, les variables de proxy, les options de chargement du runtime et les
configurations existantes ne sont pas hérités. Aucun identifiant upstream réel n'est requis ni
accepté.

L'option explicite `--inherit-isolated-env` du harness transmet `--inherit-env` à
`omniroute run`, ce qui permet aux options de suppression de métadonnées et de mises à jour
contrôlées par le harness d'atteindre le processus enfant tiers. Elle est désactivée par défaut et
reconstruit tout de même l'environnement externe à partir de la même liste d'autorisation
restreinte : elle n'hérite jamais des secrets de l'appelant, de `NODE_OPTIONS`, `NODE_PATH`,
`LD_PRELOAD`, `PYTHONPATH` ni des paramètres de proxy. Le chiffrement du stockage utilise
uniquement un sentinel non secret à l'intérieur du répertoire de données jetable. Le harness
sélectionne également les métadonnées de modèles empaquetées de LiteLLM et une sortie Python sans
tampon ; ce sont des contrôles de test fixes, et non des valeurs d'environnement fournies par
l'appelant. Cette option exige un CLI qui implémente `run --inherit-env` ; les lanceurs non pris
en charge échouent normalement et ne doivent pas être comptés comme un smoke test réussi.

Un PASS exige une sortie réussie du processus enfant, le chemin de protocole et le modèle
attendus, l'en-tête d'autorisation sentinel, une réponse HTTP complète et un marqueur de réponse
imprévisible généré par le serveur dans stdout. Le marqueur n'apparaît pas dans le prompt : afficher
le prompt ou un diagnostic ne peut donc pas satisfaire le test. Cela prouve le contrat de
transport et de réponse du binaire installé, et non l'authentification réelle auprès d'un
fournisseur, l'exécution d'outils, un déploiement en production, ni toutes les versions de CLI.

Le runner borne la sortie capturée et le temps d'exécution. Sous POSIX, il crée un groupe de
processus dédié et termine les membres restants de ce groupe au démontage ; Windows renvoie
actuellement `HOLD-process-isolation`, car le nettoyage équivalent des descendants n'est pas
implémenté. Les fichiers temporaires et les sockets du serveur sont fermés après chaque cible. Il
s'agit d'une isolation de configuration et de processus, **et non d'un sandbox réseau du système
d'exploitation** : les binaires tiers peuvent tenter leurs propres requêtes de métadonnées ou de
mise à jour. N'exécutez que des binaires installés de confiance et utilisez un environnement
restreint de l'extérieur si zéro trafic hors loopback est requis.

Exécutez les tests déterministes du harness sans binaires tiers :

```bash
node --import tsx/esm --test tests/unit/cli/real-cli-smoke-harness.test.ts tests/unit/cli/real-cli-smoke-safety.test.ts
```

Le mock prend en charge JSON/SSE de l'API OpenAI Chat Completions et de l'API Responses. Il ne
transmet jamais de requêtes à un fournisseur. Les tests upstream dépendant d'identifiants restent
une validation opt-in distincte et ne doivent pas être présentés comme couverts par ce harness.
