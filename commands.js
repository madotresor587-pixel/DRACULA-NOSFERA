const jokes = [
  "Un élève dit : « Monsieur, je n’ai pas raté le cours, j’étais juste absent physiquement. » 😂",
  "Au marché, le client demande une réduction. La vendeuse répond : « Je peux réduire le prix… mais pas le piment ! » 🌶️",
  "Mon téléphone est tellement intelligent qu’il met le mode avion dès qu’il voit mon solde bancaire. ✈️😂",
  "Le paresseux a dit : « Je ne remets pas à demain… je reporte à une date indéterminée. » 😭"
];

const quotes = [
  "« Petit à petit, l’oiseau fait son nid. » 🐦",
  "« Celui qui pose une question apprend ; celui qui n’en pose pas reste avec son doute. »",
  "« Le succès commence souvent par un petit pas régulier. » 💪",
  "« La patience et la persévérance font avancer les projets. » 🌱"
];

const helpText = (botName) =>
  `🧛🏾 *${botName} — MENU*\n\n` +
  `*Informations*\n.menu — afficher ce menu\n.ping — tester le bot\n.info — infos du bot\n.owner — propriétaire/configuration\n\n` +
  `*Utilitaires*\n.date — date du jour\n.heure — heure du téléphone serveur\n.choisir option1 | option2 — choisir au hasard\n.de — lancer un dé\n.pile — pile ou face\n\n` +
  `*Divertissement*\n.blague — blague aléatoire\n.citation — citation aléatoire\n\n` +
  `*Groupes*\n.groupe — informations du groupe (dans un groupe)\n.regles — afficher les règles suggérées\n\n` +
  `Préfixe : .`;

export function parseCommand(input) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed.startsWith(".")) return { command: "", args: "" };
  const body = trimmed.slice(1).trim();
  if (!body) return { command: "", args: "" };
  const splitAt = body.search(/\s/);
  if (splitAt === -1) return { command: body.toLowerCase(), args: "" };
  return {
    command: body.slice(0, splitAt).toLowerCase(),
    args: body.slice(splitAt).trim()
  };
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export async function getCommandReply(parsed, context) {
  const { command, args } = parsed;
  const { botName, isGroup, sock, jid } = context;
  const now = new Date();

  switch (command) {
    case "menu":
    case "help":
    case "aide":
      return helpText(botName);
    case "ping":
      return "🏓 Pong ! DRACULA NOSFERA répond correctement.";
    case "info":
      return `🧛🏾 ${botName}\n⚙️ Version 1.1.0\n📱 Node.js / Termux\n🧩 Commandes de base activées`;
    case "owner":
    case "proprietaire":
      return "👤 Le propriétaire n’a pas encore été configuré. Ajoute son contact dans les paramètres du projet avant d’afficher un numéro.";
    case "date":
      return `📅 Date : ${new Intl.DateTimeFormat("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      }).format(now)}`;
    case "heure":
    case "time":
      return `🕒 Heure du serveur : ${new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit", minute: "2-digit", timeZoneName: "short"
      }).format(now)}`;
    case "blague":
    case "joke":
      return pick(jokes);
    case "citation":
    case "quote":
      return `💬 ${pick(quotes)}`;
    case "de":
    case "dice":
      return `🎲 Tu as obtenu : *${1 + Math.floor(Math.random() * 6)}*`;
    case "pile":
    case "face":
      return Math.random() < 0.5 ? "🪙 Résultat : *PILE*" : "🪙 Résultat : *FACE*";
    case "choisir": {
      const options = args.split("|").map((item) => item.trim()).filter(Boolean);
      if (options.length < 2) return "Utilisation : .choisir pizza | attiéké | riz";
      return `🤔 Je choisis : *${pick(options)}*`;
    }
    case "groupe": {
      if (!isGroup) return "ℹ️ Cette commande fonctionne uniquement dans un groupe WhatsApp.";
      const metadata = await sock.groupMetadata(jid);
      const admins = metadata.participants.filter((participant) => participant.admin).length;
      return `👥 *Informations du groupe*\nNom : ${metadata.subject || "Sans nom"}\nMembres : ${metadata.participants.length}\nAdministrateurs : ${admins}`;
    }
    case "regles":
    case "rules":
      return "📜 *Règles suggérées du groupe*\n1. Respecter tout le monde.\n2. Éviter le spam et les messages répétés.\n3. Ne pas partager les informations privées d’autrui.\n4. Demander l’accord avant d’ajouter ou de mentionner des personnes.\n5. Respecter les administrateurs et les règles du groupe.";
    default:
      return `❓ Commande inconnue : .${command}\nTape .menu pour voir les commandes disponibles.`;
  }
}
