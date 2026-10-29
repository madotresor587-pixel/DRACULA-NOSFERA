# 🧛🏾 DRACULA NOSFERA

Bot WhatsApp expérimental en JavaScript/Node.js pour Termux, basé sur Baileys.

## Commandes

**Commandes inspirées de DEADPOOL-MD :** `.settings`, `.password 16`, `.uuid`, `.hash texte`, `.base64 encode/decode texte`, `.convert 10 km mi`, `.fact`, `.rate texte`, `.ship prénom1 | prénom2`, `.rps pierre/papier/ciseaux` et alias `.calc`, `.groupinfo`, `.choose`, `.reverse`, `.joke`, `.quote`, `.roll`, `.coin`, `.sysinfo`.\n\n**Base et outils :** `.menu`, `.ping`, `.info`, `.diagnostic`, `.correcteur`, `.calcul`, `.date`, `.heure`, `.uptime`, `.memoire`, `.blague`, `.citation`, `.de`, `.pile`, `.8ball`, `.choisir`, `.hasard`, `.quiz`, `.inverse`, `.majuscules`, `.minuscules`, `.compter`, `.emoji`.

**IA :** `.ia ta question` ou `.ai ta question`. Nécessite une clé API OpenAI et un compte/configuration API valide. Ajoute la clé uniquement dans le fichier local `.env`, jamais dans GitHub. L’utilisation de l’API peut être facturée selon ton compte.

**Médias :**
- `.play nom du morceau` : recherche et renvoie des liens de résultats vidéo/musique ; ne télécharge pas le fichier.
- `.video titre` : recherche et renvoie des liens vidéo.
- `.sticker` ou `.s` : réponds à une image normale pour la convertir en sticker.
- `.vv` : réponds à une photo, une vidéo ou un audio normal pour le renvoyer en vue unique (`viewOnce`). Tu peux ajouter une légende après la commande pour les photos/vidéos, par exemple `.vv à voir une fois`.
- `.react ❤️` : réponds à un message pour lui appliquer une réaction.
- Pour respecter la confidentialité, `.vv` refuse de retransmettre les médias déjà reçus en vue unique. Les documents et stickers ne sont pas pris en charge.
- La conversion de vidéo/GIF en sticker animé n’est pas encore implémentée.

**Groupes :**
- `.groupe` / `.groupinfo`, `.admins`, `.tagadmins`, `.hidetag`, `.poll Question | option 1 | option 2`, `.lien`, `.tagall`, `.kick @membre`, `.promote @membre`, `.demote @membre`, `.mute`, `.unmute`, `.setname`, `.setdesc`.
- `.antilink on/off` : filtrage des liens.
- `.antimention on/off` : filtre les messages contenant 5 mentions ou plus.
- `.welcome on/off` et `.goodbye on/off` : messages d’arrivée/départ.
- `.autoreact on/off` : réaction automatique dans le groupe.
- `.admins` affiche les administrateurs ; `.tagadmins`, `.hidetag` et `.poll` fonctionnent dans les groupes. Les mentions nécessitent les droits admin. Les réglages anti-lien, anti-mention, welcome/goodbye et auto-réaction sont en mémoire : ils reviennent aux valeurs par défaut après redémarrage.
- Les actions de modération nécessitent les droits appropriés. La suppression de messages peut être refusée par WhatsApp si le bot n’a pas les permissions.

**Association :** QR par défaut. Pour essayer le code d’association par numéro, configure `PAIRING_NUMBER` dans le fichier local `.env`, redémarre le bot, puis suis les instructions WhatsApp. Ne partage jamais ce numéro ni ton dossier de session.

## Installation Termux

```sh
pkg update
pkg install nodejs git
git clone https://github.com/madotresor587-pixel/DRACULA-NOSFERA.git
cd DRACULA-NOSFERA
npm install
cp .env.example .env
nano .env
npm run check
npm test
npm start
```

Pour une copie déjà installée : `git pull`, puis `npm install`, `npm run check`, `npm test` et `npm start`.

## Limites importantes

- L’objectif de 430 commandes n’est pas encore atteint. Seules les fonctions décrites comme implémentées sont disponibles.
- `.play` et `.video` renvoient des liens de recherche, pas un téléchargement audio/vidéo.
- WhatsApp autorise normalement une seule réaction active par compte et par message. La commande `.react` applique une réaction, elle ne peut pas fabriquer plusieurs réactions distinctes du même compte.
- Les canaux WhatsApp (`@newsletter`) sont ignorés par le gestionnaire actuel. Réagir automatiquement à une publication de canal et lire son nombre de réactions ne sont pas implémentés ni garantis par Baileys.
- Le service IA exige une clé API valide; garde-la privée.
- Ne publie jamais `auth_info/`, `.env`, les codes d’association, les mots de passe ou clés API.
- Baileys est une bibliothèque non officielle. Utilise le bot de façon respectueuse, évite le spam et respecte les règles WhatsApp.
