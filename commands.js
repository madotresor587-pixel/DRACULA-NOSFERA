const jokes = [
  "Un élève dit : « Monsieur, je n’ai pas raté le cours, j’étais juste absent physiquement. » 😂",
  "Au marché, le client demande une réduction. La vendeuse répond : « Je peux réduire le prix… mais pas le piment ! » 🌶️",
  "Mon téléphone est tellement intelligent qu’il active le mode avion quand il voit mon solde bancaire. ✈️😂",
  "Le paresseux a dit : « Je ne remets pas à demain… je reporte à une date indéterminée. » 😭",
  "Mon budget et moi, on ne se parle plus depuis la fin du mois. 💸",
  "En Côte d’Ivoire, même le GPS peut dire : « Mon frère, demande au gbaka, moi-même je suis perdu ! » 😂"
];
const quotes = [
  "« Petit à petit, l’oiseau fait son nid. » 🐦",
  "« Le succès commence souvent par un petit pas régulier. » 💪",
  "« La patience et la persévérance font avancer les projets. » 🌱",
  "« Apprendre chaque jour, c’est préparer les possibilités de demain. » 📚"
];
const quizzes = [
  { q: "Quel est le résultat de 7 × 8 ?", a: ["56", "54", "64"], correct: 0 },
  { q: "Combien de côtés possède un hexagone ?", a: ["5", "6", "8"], correct: 1 },
  { q: "Quelle planète est surnommée la planète rouge ?", a: ["Mars", "Vénus", "Jupiter"], correct: 0 },
  { q: "Combien de minutes y a-t-il dans 2 heures ?", a: ["100", "120", "180"], correct: 1 }
];
const COMMANDS = [
  [".menu / .help / .aide / !menu", "Afficher le menu"],
  [".ping / !ping", "Tester la réponse du bot"],
  [".info", "Version et environnement"],
  [".diagnostic / .correcteur", "Diagnostic et auto-test local"],
  [".calcul 12*(4+3)", "Calculatrice sécurisée"],
  [".date / .heure / .uptime", "Date, heure et durée du processus"],
  [".memoire", "Utilisation mémoire"],
  [".blague / .citation", "Divertissement"],
  [".de / .pile / .8ball question", "Jeux aléatoires"],
  [".choisir A | B / .hasard 1 100", "Choix ou nombre aléatoire"],
  [".quiz", "Question de quiz"],
  [".inverse / .majuscules / .minuscules", "Outils de texte"],
  [".compter / .emoji", "Compter texte ou envoyer un emoji"],
  [".groupe / .lien", "Informations du groupe et lien d’invitation"],
  [".tagall", "Mentionner les membres (admin requis)"],
  [".kick @membre", "Retirer un membre (admin requis)"],
  [".promote / .demote @membre", "Gérer les admins (admin requis)"],
  [".mute / .unmute", "Fermer ou ouvrir le groupe (admin requis)"],
  [".setname / .setdesc", "Modifier les infos du groupe (admin requis)"],
  [".regles / .owner", "Règles et configuration"]
];

export function parseCommand(input) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed.startsWith(".") && !trimmed.startsWith("!")) return { command: "", args: "" };
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
    "\\n\\nPréfixes : . ou !\\n⚠️ Les commandes d’administration exigent les droits administrateur.";
}
export function calculate(expression) {
  const input = String(expression ?? "").replace(/\s+/g, "");
  if (!input || input.length > 100 || !/^[0-9.+\-*/()%]+$/.test(input)) throw new Error("Utilise seulement les nombres, + - * / % et les parenthèses.");
  let i = 0;
  function primary() {
    if (input[i] === "+") { i++; return primary(); }
    if (input[i] === "-") { i++; return -primary(); }
    if (input[i] === "(") { i++; const value = sum(); if (input[i] !== ")") throw new Error("Parenthèses incorrectes."); i++; return value; }
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
      const op = input[i++], right = primary();
      if ((op === "/" || op === "%") && right === 0) throw new Error("Division par zéro impossible.");
      if (op === "*") value *= right;
      if (op === "/") value /= right;
      if (op === "%") value %= right;
    }
    return value;
  }
  function sum() {
    let value = term();
    while (input[i] === "+" || input[i] === "-") { const op = input[i++], right = term(); value = op === "+" ? value + right : value - right; }
    return value;
  }
  const result = sum();
  if (i !== input.length || !Number.isFinite(result)) throw new Error("Expression invalide ou résultat non fini.");
  return Number(result.toPrecision(12));
}
function duration(seconds) {
  const s = Math.floor(seconds), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [d ? d + "j" : "", h ? h + "h" : "", m ? m + "min" : "", sec + "s"].filter(Boolean).join(" ");
}
function mentionsFrom(message) {
  const context = message?.message?.extendedTextMessage?.contextInfo;
  return context?.mentionedJid ?? [];
}
function senderJid(message) { return message?.key?.participant ?? message?.key?.remoteJid; }
async function requireGroupAdmin(context) {
  if (!context.isGroup) return { ok: false, reply: "ℹ️ Cette commande fonctionne uniquement dans un groupe WhatsApp." };
  const meta = await context.sock.groupMetadata(context.jid);
  const sender = senderJid(context.message);
  const participant = meta.participants.find(p => p.id === sender);
  if (!participant?.admin) return { ok: false, reply: "⛔ Cette action est réservée aux administrateurs du groupe." };
  return { ok: true, meta, sender };
}
export async function getCommandReply(parsed, context) {
  const { command, args } = parsed;
  const { botName, isGroup, sock, jid, message } = context;
  const now = new Date();
  switch (command) {
    case "menu": case "help": case "aide": return formatMenu(botName);
    case "ping": return "🏓 Pong ! Le gestionnaire de messages répond.";
    case "info": return "🧛🏾 " + botName + "\\n⚙️ Version 1.3.0\\n📱 Node.js / Termux\\n🧩 Préfixes . et !\\n🛠️ Diagnostic, outils et commandes de groupe";
    case "correcteur": case "selftest": {
      const checks = [];
      try { checks.push(calculate("2+2") === 4); } catch { checks.push(false); }
      try { checks.push(calculate("12*(4+3)") === 84); } catch { checks.push(false); }
      checks.push(parseCommand(".ping").command === "ping", parseCommand("!menu").command === "menu");
      const passed = checks.filter(Boolean).length;
      return "🛠️ AUTO-TEST DRACULA NOSFERA\\nRésultats : " + passed + "/" + checks.length + " contrôles réussis.\\n" +
        (passed === checks.length ? "✅ Calculateur et analyseur de commandes OK." : "⚠️ Un contrôle a échoué : lance npm test.") +
        "\\nCe test ne répare pas la connexion WhatsApp ni les dépendances.";
    }
    case "diagnostic": case "diag": {
      const m = process.memoryUsage();
      return "🩺 DIAGNOSTIC LOCAL\\nNode.js : " + process.version + "\\nPlateforme : " + process.platform +
        "\\nUptime : " + duration(process.uptime()) + "\\nMémoire RSS : " + (m.rss / 1048576).toFixed(1) + " Mo" +
        "\\nHeap utilisé : " + (m.heapUsed / 1048576).toFixed(1) + " Mo\\nGestionnaire de commandes : actif" +
        "\\nVérifie l’état WhatsApp dans Termux. Ce diagnostic n’effectue pas de réparation automatique.";
    }
    case "calcul": case "calc": case "math":
      try { return args ? "🧮 " + args + " = *" + calculate(args) + "*" : "Utilisation : .calcul 12*(4+3)"; }
      catch (e) { return "❌ Calcul impossible : " + e.message; }
    case "owner": case "proprietaire": return process.env.OWNER_NUMBER ? "👤 Propriétaire configuré dans l’environnement." : "👤 Contact propriétaire non configuré. Aucun numéro n’est inventé ni affiché.";
    case "date": return "📅 " + new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
    case "heure": case "time": return "🕒 Heure du serveur : " + new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" }).format(now);
    case "uptime": return "⏱️ Le processus tourne depuis " + duration(process.uptime()) + ".";
    case "memoire": case "memory": { const m = process.memoryUsage(); return "🧠 Mémoire\\nRSS : " + (m.rss / 1048576).toFixed(1) + " Mo\\nHeap : " + (m.heapUsed / 1048576).toFixed(1) + "/" + (m.heapTotal / 1048576).toFixed(1) + " Mo"; }
    case "blague": case "joke": return pick(jokes);
    case "citation": case "quote": return "💬 " + pick(quotes);
    case "de": case "dice": return "🎲 Tu as obtenu : *" + (1 + Math.floor(Math.random() * 6)) + "*";
    case "pile": case "face": case "coin": return Math.random() < 0.5 ? "🪙 Résultat : *PILE*" : "🪙 Résultat : *FACE*";
    case "8ball": case "boule": return args ? "🎱 " + pick(["Oui, probablement !", "C’est possible.", "Les signes sont favorables.", "Pas sûr, réessaie plus tard.", "Je ne peux pas le prédire.", "Mieux vaut réfléchir encore."]) : "Utilisation : .8ball Est-ce que j’aurai de la chance ?";
    case "choisir": { const options = args.split("|").map(x => x.trim()).filter(Boolean); return options.length < 2 ? "Utilisation : .choisir pizza | attiéké | riz" : "🤔 Je choisis : *" + pick(options) + "*"; }
    case "hasard": case "random": { const p = args.split(/\s+/).map(Number); if (p.length !== 2 || !p.every(Number.isInteger) || p[0] > p[1] || p[1] - p[0] > 1000000000) return "Utilisation : .hasard 1 100"; return "🎲 Nombre choisi : *" + (Math.floor(Math.random() * (p[1] - p[0] + 1)) + p[0]) + "*"; }
    case "quiz": { const q = pick(quizzes); return "🧠 *QUIZ*\\n" + q.q + "\\nA) " + q.a[0] + "\\nB) " + q.a[1] + "\\nC) " + q.a[2] + "\\nRéponds A, B ou C. (Réponse : " + ["A","B","C"][q.correct] + ")"; }
    case "inverse": return args ? [...args].reverse().join("") : "Utilisation : .inverse Bonjour";
    case "majuscules": case "upper": return args ? args.toLocaleUpperCase("fr-FR") : "Utilisation : .majuscules ton texte";
    case "minuscules": case "lower": return args ? args.toLocaleLowerCase("fr-FR") : "Utilisation : .minuscules TON TEXTE";
    case "compter": case "count": return args ? "🔢 Caractères : " + [...args].length + "\\nMots : " + ((args.match(/\S+/g) || []).length) : "Utilisation : .compter un texte";
    case "emoji": return args ? "✨ " + args : "😀 😎 😂 🔥 ❤️ 🧛🏾 🎉 💯";
    case "groupe": {
      if (!isGroup) return "ℹ️ Cette commande fonctionne uniquement dans un groupe.";
      const meta = await sock.groupMetadata(jid);
      return "👥 Informations du groupe\\nNom : " + (meta.subject || "Sans nom") + "\\nMembres : " + meta.participants.length + "\\nAdministrateurs : " + meta.participants.filter(p => p.admin).length;
    }
    case "lien": case "link": {
      const auth = await requireGroupAdmin(context);
      if (!auth.ok) return auth.reply;
      const code = await sock.groupInviteCode(jid);
      return "🔗 Lien d’invitation du groupe : https://chat.whatsapp.com/" + code;
    }
    case "tagall": case "mentionall": {
      const auth = await requireGroupAdmin(context);
      if (!auth.ok) return auth.reply;
      const participants = auth.meta.participants;
      const text = args || "📢 Attention à tous !";
      const mentions = participants.map(p => p.id);
      const labels = participants.map(p => "@" + p.id.split("@")[0]).join(" ");
      await sock.sendMessage(jid, { text: text + "\\n\\n" + labels, mentions }, { quoted: message });
      return "";
    }
    case "kick": case "retirer": case "promote": case "demote": {
      const auth = await requireGroupAdmin(context);
      if (!auth.ok) return auth.reply;
      const targets = mentionsFrom(message);
      if (!targets.length) return "Mentionne le membre à cibler, par exemple : ." + command + " @membre";
      const action = command === "kick" || command === "retirer" ? "remove" : command;
      await sock.groupParticipantsUpdate(jid, targets, action);
      return "✅ Action demandée : " + action + ". WhatsApp peut la refuser selon les droits et le statut des membres.";
    }
    case "mute": case "unmute": {
      const auth = await requireGroupAdmin(context);
      if (!auth.ok) return auth.reply;
      await sock.groupSettingUpdate(jid, command === "mute" ? "announcement" : "not_announcement");
      return command === "mute" ? "🔒 Groupe fermé : seuls les admins peuvent envoyer des messages." : "🔓 Groupe ouvert aux messages des membres.";
    }
    case "setname": {
      const auth = await requireGroupAdmin(context);
      if (!auth.ok) return auth.reply;
      if (!args) return "Utilisation : .setname Nouveau nom";
      await sock.groupUpdateSubject(jid, args.slice(0, 100));
      return "✅ Nom du groupe mis à jour.";
    }
    case "setdesc": {
      const auth = await requireGroupAdmin(context);
      if (!auth.ok) return auth.reply;
      if (!args) return "Utilisation : .setdesc Nouvelle description";
      await sock.groupUpdateDescription(jid, args.slice(0, 2048));
      return "✅ Description du groupe mise à jour.";
    }
    case "regles": case "rules": return "📜 Règles suggérées\\n1. Respecter tout le monde.\\n2. Éviter le spam.\\n3. Ne pas partager les informations privées d’autrui.\\n4. Demander l’accord avant de partager une photo ou un contact.\\n5. Respecter les règles du groupe.";
    default: return "❓ Commande inconnue : " + (parsed.prefix || ".") + command + "\\nTape .menu pour voir les commandes disponibles.";
  }
}
