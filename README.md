# 🧛🏾 DRACULA NOSFERA

Bot WhatsApp en JavaScript pour Node.js/Termux, basé sur Baileys.

## Commandes disponibles

- `.menu`, `.help`, `.aide` : menu
- `.ping` : tester la réponse du gestionnaire
- `.info` : version et environnement
- `.diagnostic`, `.diag` : diagnostic local, version Node, plateforme, uptime et mémoire
- `.calcul`, `.calc`, `.math` : calculs avec +, -, *, /, %, parenthèses, sans eval
- `.date` : date du serveur
- `.heure`, `.time` : heure du serveur
- `.uptime` : durée de fonctionnement
- `.memoire`, `.memory` : mémoire du processus
- `.blague`, `.joke` : blague aléatoire
- `.citation`, `.quote` : citation aléatoire
- `.de`, `.dice` : dé à six faces
- `.pile`, `.face` : pile ou face
- `.choisir A | B` : choix aléatoire
- `.hasard 1 100`, `.random` : nombre aléatoire
- `.inverse texte` : inverser un texte
- `.majuscules texte`, `.upper` : majuscules
- `.minuscules texte`, `.lower` : minuscules
- `.compter texte`, `.count` : compter caractères et mots
- `.groupe` : informations du groupe
- `.regles`, `.rules` : règles suggérées
- `.owner`, `.proprietaire` : état de configuration du propriétaire

L’objectif initial est 430 commandes, mais seules les commandes ci-dessus sont actuellement implémentées. Les autres ne sont pas annoncées comme disponibles tant qu’elles ne sont pas ajoutées et testées.

## Installation

Dans Termux : installe Node.js et Git, puis exécute `git clone https://github.com/madotresor587-pixel/DRACULA-NOSFERA.git`, entre dans le dossier, puis lance `npm install`, `npm run check`, `npm test` et `npm start`.

Scanne le QR depuis WhatsApp > Appareils connectés > Connecter un appareil.

## Mise à jour

Dans le dossier du projet : `git pull`, puis `npm install`, `npm run check`, `npm test`, et enfin `npm start`.

GitHub Actions exécute automatiquement les vérifications et les tests sur les changements de la branche main. Consulte l’onglet Actions pour voir les résultats.

## Sécurité

- Ne partage jamais `auth_info/` : ce dossier contient la session WhatsApp.
- Ne partage jamais de code de vérification, mot de passe, jeton ou fichier `.env`.
- Le dépôt est public : n’y publie aucun secret.
- Baileys est une bibliothèque non officielle. Respecte les règles de WhatsApp.
- Le diagnostic informe mais ne répare pas automatiquement les problèmes de réseau ou de session.
