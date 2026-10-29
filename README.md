# 🧛🏾 DRACULA NOSFERA

Bot WhatsApp JavaScript/Node.js pour Termux, basé sur Baileys.

## Commandes actuellement implémentées

**Base et diagnostic**
- `.menu`, `.help`, `.aide`, `!menu` : menu
- `.ping`, `!ping` : test de réponse
- `.info` : version
- `.diagnostic`, `.diag` : plateforme, Node.js, uptime, mémoire
- `.correcteur`, `.selftest` : auto-test léger du parseur et de la calculatrice
- `.owner`, `.proprietaire` : état de la configuration propriétaire

**Outils**
- `.calcul`, `.calc`, `.math` : calculs + - * / % et parenthèses (sans eval)
- `.date`, `.heure`, `.time`, `.uptime`, `.memoire`, `.memory`
- `.inverse texte`, `.majuscules texte`, `.minuscules texte`, `.compter texte`, `.emoji`

**Jeux et divertissement**
- `.blague`, `.joke`, `.citation`, `.quote`, `.de`, `.dice`, `.pile`, `.face`, `.coin`
- `.8ball question`, `.boule question`, `.choisir A | B`, `.hasard 1 100`, `.random`, `.quiz`

**Groupes WhatsApp**
- `.groupe` : nom, nombre de membres et admins
- `.lien`, `.link` : lien d’invitation, administrateur du groupe requis
- `.tagall`, `.mentionall` : mentionner les membres, administrateur requis
- `.kick @membre`, `.retirer @membre`, `.promote @membre`, `.demote @membre`
- `.mute`, `.unmute`, `.setname Nouveau nom`, `.setdesc Nouvelle description`
- `.regles`, `.rules` : règles suggérées

Les actions de modération nécessitent les droits WhatsApp adéquats. WhatsApp peut refuser une action selon les rôles, la version de Baileys ou les paramètres du groupe.

## Installer dans Termux

Si le dépôt n’est pas encore cloné :
```sh
pkg update
pkg install nodejs git
git clone https://github.com/madotresor587-pixel/DRACULA-NOSFERA.git
cd DRACULA-NOSFERA
npm install
npm run check
npm test
npm start
```

Pour une copie déjà présente, ouvre le dossier du projet et lance :
```sh
git pull
npm install
npm run check
npm test
npm start
```

Associe le bot depuis WhatsApp > Appareils connectés > Connecter un appareil. Si le QR est affiché, scanne-le avec le téléphone qui possède le compte.

## Tests automatisés

GitHub Actions lance `npm run check` et `npm test` sur les changements de `main`. Consulte l’onglet Actions pour le résultat du dernier commit.

## Sécurité et limites

- Le projet vise à progresser vers l’objectif de 430 commandes, mais **seules les commandes listées ici sont implémentées**. Ne considère pas les autres comme disponibles.
- Le diagnostic et l’auto-test n’effectuent pas de réparation automatique du compte WhatsApp ou du réseau.
- Ne publie jamais `auth_info/`, des mots de passe, codes d’association, clés API ou fichiers secrets.
- `auth_info/`, `node_modules/`, `.env` et les logs sont exclus du dépôt par `.gitignore`.
- Baileys est une bibliothèque non officielle ; utilise-la prudemment et respecte les règles WhatsApp.
