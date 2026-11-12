---
title: "Aperçus et écritures de la configuration CLI"
---

# Aperçus et écritures de la configuration CLI

Les routes authentifiées `/api/cli-tools/config` et `/api/cli-tools/apply` renvoient des
aperçus masqués, non cachables. Elles conservent les contrôles d'authentification et
d'autorisation existants. Les corps de requête rejettent les champs inconnus. Une URL de base
explicite doit utiliser HTTP(S) sans identifiants (nom d'utilisateur/mot de passe) intégrés ;
lorsqu'elle est omise, l'URL de base configurée sur le serveur est utilisée.

Pour un aperçu par lot, `GET /api/cli-tools/config` accepte un paramètre de requête `baseUrl`
facultatif et prend l'identifiant de configuration dans l'en-tête
`x-omniroute-config-api-key`. Les identifiants présents dans la chaîne de requête sont
rejetés. `POST /api/cli-tools/config` accepte `toolId`, `baseUrl`, `apiKey` et, de manière
facultative, `model` dans son corps JSON. Les réponses utilisent `Cache-Control: no-store`
aussi bien en cas de succès que d'erreur. Le texte de l'aperçu n'est pas une configuration
utilisable contenant des identifiants.

La projection de l'aperçu masque les identifiants sérialisés de l'appelant ainsi que les
champs d'identifiants déjà présents dans les profiles JSONC, TOML ou YAML fusionnés. La route
apply écrit la configuration d'origine ; le masquage de l'aperçu ne modifie pas les valeurs
sur disque. Un JSON mal formé est rejeté avec le code 400. Les réponses d'erreur publiques
utilisent l'enveloppe d'erreur assainie standard.

L'application d'une configuration utilise un fichier temporaire privé dans le répertoire de
destination, le synchronise sur disque, puis le renomme de façon atomique à son emplacement final.
Les fichiers et les sauvegardes utilisent le mode `0600` ; les permissions sont définies sur
le descripteur détenu avant le renommage. Les liens symboliques de destination finale et les
fichiers non réguliers sont refusés. Les lectures Codex et OpenCode refusent également les
liens symboliques sur le chemin final avant de fusionner du TOML/JSONC existant. Cela ne
prétend pas protéger contre un adversaire qui contrôle le répertoire parent.

La protection d'écriture en conteneur reste active : une destination éphémère non sûre renvoie
422 et dirige l'opérateur vers la commande de configuration côté hôte. Une exécution à blanc
reste disponible et n'écrit aucun fichier. Consultez [intégrations CLI](../guides/CLI-INTEGRATIONS.md)
pour les commandes de configuration côté hôte prises en charge et
[assainissement des erreurs](./ERROR_SANITIZATION.md) pour le contrat d'erreur public.
