const jokes = [
  "Un élève dit : « Monsieur, je n’ai pas raté le cours, j’étais juste absent physiquement. » 😂",
  "Au marché, le client demande une réduction. La vendeuse répond : « Je peux réduire le prix… mais pas le piment ! » 🌶️",
  "Mon téléphone est tellement intelligent qu’il met le mode avion dès qu’il voit mon solde bancaire. ✈️😂",
  "Le paresseux a dit : « Je ne remets pas à demain… je reporte à une date indéterminée. » 😭",
  "Mon budget et moi, on ne se parle plus depuis la fin du mois. 💸"
];
const quotes = [
  "« Petit à petit, l’oiseau fait son nid. » 🐦",
  "« Le succès commence souvent par un petit pas régulier. » 💪",
  "« La patience et la persévérance font avancer les projets. » 🌱"
];
const COMMANDS = [
  [".menu / .help / .aide", "Menu des commandes"],
  [".ping", "Tester la réponse"],
  [".info", "Version et environnement"],
  [".diagnostic", "Diagnostic local non destructif"],
  [".calcul 12*(4+3)", "Calcul arithmétique sécurisé"],
  [".date / .heure", "Date et heure du serveur"],
  [".uptime", "Durée de fonctionnement"],
  [".memoire", "Mémoire utilisée"],
  [".blague / .citation", "Divertissement"],
  [".de / .pile", "Dé ou pile/face"],
  [".choisir A | B", "Choix au hasard"],
  [".hasard 1 100", "Nombre aléatoire"],
  [".inverse texte", "Inverser un texte"],
  [".majuscules texte", "Texte en majuscules"],
  [".minuscules texte", "Texte en minuscules"],
  [".compter texte", "Compter caractères et mots"],
  [".groupe", "Infos du groupe"],
  [".regles", "Règles suggérées"],
  [".owner", "Configuration propriétaire"]
];

export function parseCommand(input) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed.startsWith(".")) return { command: "", args: "" };
  const body = trimmed.slice(1).trim();
  if (!body) return { command: "", args: "" };
  const splitAt = body.search(/\s/);
  return splitAt === -1
    ? { command: body.toLowerCase(), args: "" }
    : { command: body.slice(0, splitAt).toLowerCase(), args: body.slice(splitAt).trim() };
}

function pick(items) { return items[Math.floor(Math.random() * items.length)]; }
function formatMenu(botName) {
  return "*" + botName + " — MENU*\\n\\n" +
    COMMANDS.map(([name, desc]) => name + " — " + desc).join("\\n") +
    "\\n\\nPréfixe : .\\nℹ️ Certaines commandes fonctionnent uniquement dans un groupe.";
}

// Calculateur arithmétique récursif. Aucun eval() ni Function().
export function calculate(expression) {
  const input = String(expression ?? "").replace(/\s+/g, "");
  if (!input || input.length > 100 || !/^[0-9.+\-*/()%]+$/.test(input)) {
    throw new Error("Utilise seulement les nombres, + - * / % et les parenthèses.");
  }
  let i = 0;
  function primary() {
    if (input[i] === "+") { i++; return primary(); }
    if (input[i] === "-") { i++; return -primary(); }
    if (input[i] === "(") {
      i++;
      const value = sum();
      if (input[i] !== ")") throw new Error("Parenthèses incorrectes.");
      i++;
      return value;
    }
    const start = i;
    while (i < input.length && /[0-9.]/.test(input[i])) i++;
    if (start === i) throw new Error("Expression mathématique invalide.");
    const raw = input.slice(start, i);
    if ((raw.match(/\./g) || []).length > 1) throw new Error("Nombre invalide.");
    return Number(raw);
  }
  function term() {
    let value = primary();
    while (["*", "/", "%"].includes(input[i])) {
      const op = input[i++];
      const right = primary();
      if ((op === "/" || op === "%") && right === 0) throw new Error("Division par zéro impossible.");
      if (op === "*") value *= right;
      if (op === "/") value /= right;
      if (op === "%") value %= right;
    }
    return value;
  }
  function sum() {
    let value = term();
    while (input[i] === "+" || input[i] === "-") {
      const op = input[i++];
      const right = term();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }
  const result = sum();
  if (i !== input.length || !Number.isFinite(result)) throw new Error("Expression invalide ou résultat non fini.");
  return Number(result.toPrecision(12));
}
function duration(seconds) {
  const s = Math.floor(seconds), d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [d ? d + "j" : "", h ? h + "h" : "", m ? m + "min" : "", sec + "s"].filter(Boolean).join(" ");
}

export async function getCommandReply(parsed, context) {
  const command = parsed.command, args = parsed.args;
  const botName = context.botName, isGroup = context.isGroup, sock = context.sock, jid = context.jid;
  const now = new Date();
  switch (command) {
    case "menu": case "help": case "aide": return formatMenu(botName);
    case "ping": return "🏓 Pong ! Le gestionnaire de messages répond.";
    case "info": return "🧛🏾 " + botName + "\\n⚙️ Version 1.2.0\\n📱 Node.js / Termux\\n🧩 Commandes utilitaires activées";
    case "diagnostic": case "diag": {
      const m = process.memoryUsage();
      return "🩺 DIAGNOSTIC LOCAL\\nNode.js : " + process.version +
        "\\nPlateforme : " + process.platform + "\\nUptime : " + duration(process.uptime()) +
        "\\nMémoire RSS : " + (m.rss / 1048576).toFixed(1) + " Mo" +
        "\\nHeap utilisé : " + (m.heapUsed / 1048576).toFixed(1) + " Mo" +
        "\\nGestionnaire de commandes : actif" +
        "\\nWhatsApp : vérifie l’état de connexion dans Termux." +
        "\\n⚠️ Le diagnostic ne répare pas automatiquement les problèmes réseau ou de session.";
    }
    case "calcul": case "calc": case "math":
      try {
        if (!args) return "Utilisation : .calcul 12*(4+3)";
        return "🧮 " + args + " = *" + calculate(args) + "*";
      } catch (e) { return "❌ Calcul impossible : " + e.message; }
    case "owner": case "proprietaire": return "👤 Contact propriétaire non configuré. Aucun numéro n’est inventé ni affiché.";
    case "date": return "📅 " + new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
    case "heure": case "time": return "🕒 Heure du serveur : " + new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" }).format(now);
    case "uptime": return "⏱️ Le processus tourne depuis " + duration(process.uptime()) + ".";
    case "memoire": case "memory": {
      const m = process.memoryUsage();
      return "🧠 Mémoire du bot\\nRSS : " + (m.rss / 1048576).toFixed(1) + " Mo\\nHeap utilisé : " + (m.heapUsed / 1048576).toFixed(1) + " Mo\\nHeap total : " + (m.heapTotal / 1048576).toFixed(1) + " Mo";
    }
    case "blague": case "joke": return pick(jokes);
    case "citation": case "quote": return "💬 " + pick(quotes);
    case "de": case "dice": return "🎲 Tu as obtenu : *" + (1 + Math.floor(Math.random() * 6)) + "*";
    case "pile": case "face": return Math.random() < 0.5 ? "🪙 Résultat : *PILE*" : "🪙 Résultat : *FACE*";
    case "choisir": {
      const options = args.split("|").map(x => x.trim()).filter(Boolean);
      return options.length < 2 ? "Utilisation : .choisir pizza | attiéké | riz" : "🤔 Je choisis : *" + pick(options) + "*";
    }
    case "hasard": case "random": {
      const p = args.split(/\s+/).map(Number);
      if (p.length !== 2 || !p.every(Number.isInteger) || p[0] > p[1] || p[1] - p[0] > 1000000000) return "Utilisation : .hasard 1 100";
      return "🎲 Nombre choisi : *" + (Math.floor(Math.random() * (p[1] - p[0] + 1)) + p[0]) + "*";
    }
    case "inverse": return args ? [...args].reverse().join("") : "Utilisation : .inverse Bonjour";
    case "majuscules": case "upper": return args ? args.toLocaleUpperCase("fr-FR") : "Utilisation : .majuscules ton texte";
    case "minuscules": case "lower": return args ? args.toLocaleLowerCase("fr-FR") : "Utilisation : .minuscules TON TEXTE";
    case "compter": case "count": return args ? "🔢 Caractères : " + [...args].length + "\\nMots : " + ((args.match(/\S+/g) || []).length) : "Utilisation : .compter un texte";
    case "groupe": {
      if (!isGroup) return "ℹ️ Cette commande fonctionne uniquement dans un groupe WhatsApp.";
      const meta = await sock.groupMetadata(jid);
      return "👥 Informations du groupe\\nNom : " + (meta.subject || "Sans nom") + "\\nMembres : " + meta.participants.length + "\\nAdministrateurs : " + meta.participants.filter(p => p.admin).length;
    }
    case "regles": case "rules": return "📜 Règles suggérées\\n1. Respecter tout le monde.\\n2. Éviter le spam.\\n3. Ne pas partager les informations privées d’autrui.\\n4. Demander l’accord avant de partager une photo ou un contact.\\n5. Respecter les règles du groupe.";
    default: return "❓ Commande inconnue : ." + command + "\\nTape .menu pour voir les commandes disponibles.";
  }
}
