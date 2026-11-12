---
title: "CLI Companion — guidage de terminal en copie seule"
version: 3.8.51
lastUpdated: 2026-09-22
---

# CLI Companion

Le dashboard CLI Code inclut un companion en copie seule pour les cibles CLI
exécutables prises en charge par cette version d'OmniRoute. Il ne démarre aucun
processus, n'écrit aucune configuration, ne teste aucune inférence et n'envoie
aucun identifiant au clipboard.

## La détection côté serveur n'est pas la détection côté navigateur

Les statuts de détection, d'exécution et de configuration décrivent la machine
qui exécute le serveur OmniRoute. Si vous ouvrez un dashboard distant depuis
votre ordinateur portable, l'absence d'un CLI sur ce serveur n'indique rien sur
le CLI installé sur votre ordinateur portable. Une détection inconnue ou en échec
reste explicite ; elle n'est pas traitée comme “non installé”. Les erreurs de
diagnostic brutes et les endpoints de configuration ne sont pas affichés dans ce
panneau.

Copiez les commandes dans le terminal de la machine où vous souhaitez utiliser le
CLI. Le companion ne bloque pas les instructions locales lorsque la détection
côté serveur échoue.

## Contextes locaux ou distants

Commencez par inspecter les contextes déjà configurés dans votre terminal :

```sh
omniroute contexts list
omniroute contexts current
```

Laissez le champ de contexte du companion vide pour utiliser le contexte actif du
CLI, ou saisissez le nom d'un contexte existant. Un contexte nommé peut pointer
vers un serveur local ou distant. Le dashboard ne lit pas le magasin de contextes
de votre terminal, ne crée aucun contexte et ne copie pas ses identifiants. Par
exemple, si `office` existe déjà :

```sh
omniroute configure claude --context office
omniroute run claude --context office --dry-run
```

`configure` est interactif et écrit la configuration sur la machine où vous
l'exécutez. `run --dry-run` affiche le plan de lancement sans démarrer la cible ;
il n'établit pas que l'inférence upstream fonctionne. Authentifiez le terminal en
suivant le workflow de contexte CLI existant avant d'exécuter ces commandes.

Seules les capacités déclarées par le manifest exécutable sont proposées. Si une
cible requiert un modèle, sa commande de lancement reste indisponible tant que
vous ne fournissez pas un véritable identifiant de modèle. Les champs
contexte/modèle acceptent un jeu restreint de caractères littéraux ; les
opérateurs shell, les espaces et la syntaxe d'option en tête sont rejetés.

Si l'accès au clipboard échoue, le panneau signale l'échec et laisse la commande
visible pour une sélection manuelle. La copie ne l'exécute jamais.

## Périmètre d'implémentation

Le loader réservé au serveur dans `src/lib/cli-helper/companionTargets.ts` projette
le manifest exécutable en descripteurs publics. Le navigateur ne reçoit que les
identifiants de cibles, les noms d'affichage et les indicateurs de capacités, pas
les modules Node ni les secrets d'exécution. La validation des commandes et le
mappage des statuts se trouvent dans `src/shared/utils/cliCompanion.ts`. Le
panneau réutilise la requête de statut par lot existante du dashboard ; il
n'introduit aucune API d'exécution ni aucun sondage de statut supplémentaire.
