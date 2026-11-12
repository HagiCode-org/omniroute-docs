---
title: "Identité de conversation OpenCode"
version: 3.8.51
lastUpdated: 2026-09-21
---

# Identité de conversation OpenCode

OpenCode et OpenCode Go réutilisent des identifiants de conversation explicites d'un tour à
l'autre. Le résolveur examine `x-opencode-session`, les en-têtes d'affinité/de session
existants, les en-têtes de session/thread natifs de la CLI, les métadonnées de la requête,
puis les champs session/thread de premier niveau. Le `metadata.user_id` encodé en JSON de
Claude est inspecté pour y trouver un identifiant de session ; un identifiant opaque de
compte/utilisateur n'est jamais traité à lui seul comme un identifiant de conversation.

Les valeurs contenant des caractères de contrôle, les identifiants vides et les identifiants
de plus de 256 caractères sont ignorés. L'analyse des métadonnées JSON est bornée. Avant la
traduction, le normaliseur d'en-têtes de l'executor préserve cette identité uniquement pour
les fournisseurs OpenCode ; il n'injecte pas d'en-têtes OpenCode pour les autres fournisseurs.

L'encodage canonique `ses_` existant et le fallback sur l'empreinte de conversation restent
inchangés. Sans identifiant explicite, le premier message de l'utilisateur et les autres
entrées d'empreinte existantes continuent de déterminer la continuité. Il ne s'agit ni d'une
nouvelle frontière d'autorisation ni d'une preuve d'isolation du contenu côté upstream.

L'implémentation se trouve dans `open-sse/utils/opencodeSessionIdentity.ts`,
`open-sse/utils/opencodeHeaders.ts` et
`open-sse/handlers/chatCore/executorClientHeaders.ts`. Les tests de régression couvrent les
identifiants natifs, les métadonnées Claude, la précédence, les valeurs invalides et le
comportement d'empreinte existant, sans appels upstream payants.
