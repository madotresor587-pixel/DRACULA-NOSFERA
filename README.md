# 🧛🏾 DRACULA NOSFERA

Bot WhatsApp expérimental pour Node.js et Termux, construit avec Baileys.

## Commandes disponibles

| Commande | Fonction |
|---|---|
| `.menu`, `.help`, `.aide` | Afficher le menu |
| `.ping` | Tester si le bot répond |
| `.info` | Informations de version |
| `.owner` | Indiquer que le contact propriétaire reste à configurer |
| `.date` | Date du serveur |
| `.heure`, `.time` | Heure du serveur |
| `.blague`, `.joke` | Blague aléatoire |
| `.citation`, `.quote` | Citation aléatoire |
| `.de`, `.dice` | Lancer un dé |
| `.pile`, `.face` | Pile ou face |
| `.choisir option1 | option2` | Choix aléatoire entre plusieurs options |
| `.groupe` | Nom du groupe, nombre de membres et d’administrateurs |
| `.regles`, `.rules` | Afficher des règles suggérées |

## Installation dans Termux

```sh
pkg update
pkg install nodejs git
git clone https://github.com/madotresor587-pixel/DRACULA-NOSFERA.git
cd DRACULA-NOSFERA
npm install
npm start
```

Scanne le QR code depuis WhatsApp > Appareils connectés > Connecter un appareil.

## Mettre à jour une copie déjà installée

Dans le dossier du projet :

```sh
git pull
npm install
npm run check
npm test
npm start
```

Si `git pull` indique des modifications locales ou un conflit, arrête-toi et demande de l’aide avant de supprimer des fichiers.

## Sécurité

- Ne publie et ne partage jamais `auth_info/` : ce dossier contient les informations de session WhatsApp.
- Ne partage jamais de code de vérification, mot de passe, jeton ou fichier `.env`.
- Le dépôt est public : ne committe que le code source et les fichiers sans secrets.
- Baileys est une bibliothèque non officielle. Son usage peut présenter des risques pour le compte WhatsApp ; respecte les conditions du service et teste prudemment.
- Les commandes du bot ne garantissent pas que la connexion restera active : les changements WhatsApp ou du réseau peuvent interrompre la session.

## Vérifications locales

```sh
npm run check
npm test
``
