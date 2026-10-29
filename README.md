# 🧛🏾 DRACULA NOSFERA

Bot WhatsApp expérimental pour Node.js et Termux.

## Commandes incluses
- `.menu` ou `.help` : afficher le menu.
- `.ping` : tester si le bot répond.
- `.info` : afficher les informations de base.

## Installation dans Termux
Installe les outils nécessaires :
```sh
pkg update
pkg install nodejs git
```

Télécharge le dépôt et installe les dépendances :
```sh
git clone https://github.com/madotresor587-pixel/DRACULA-NOSFERA.git
cd DRACULA-NOSFERA
npm install
npm start
```

Scanne le QR code avec WhatsApp > Appareils connectés > Connecter un appareil.

## Si tu as déjà le dossier dans Termux
Depuis le dossier du projet, récupère les derniers fichiers :
```sh
git pull
npm install
npm start
```

## Sécurité importante
- Ne publie et ne partage jamais le dossier `auth_info/` : il contient les informations de session WhatsApp.
- Ne partage jamais les codes de vérification WhatsApp, mots de passe, jetons ou fichiers `.env`.
- Le dépôt est public : seuls les fichiers du code source doivent y être envoyés.
- Baileys est une bibliothèque non officielle. Utilise-la prudemment et respecte les règles de WhatsApp.

## Vérifier la syntaxe
```sh
npm run check
```
