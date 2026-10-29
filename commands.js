import { createHash, randomBytes, randomUUID } from "node:crypto";

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
  [".choisir / .choose A | B / .hasard / .random 1 100", "Choix ou nombre aléatoire"],
  [".convert 10 km mi / .uuid / .password 16", "Conversions, identifiant et mot de passe aléatoires"],
  [".base64 encode/decode texte / .hash texte", "Encodage et empreinte SHA-256"],
  [".settings", "Afficher les réglages de groupe disponibles"],
  [".fact / .rate / .ship / .rps", "Faits, notes humoristiques et mini-jeux"],
  [".quiz", "Question de quiz"],
  [".inverse / .majuscules / .minuscules", "Outils de texte"],
  [".compter / .emoji", "Compter texte ou envoyer un emoji"],
  [".groupe / .groupinfo / .admins / .tagadmins / .hidetag / .lien", "Informations et mentions de groupe"],
  [".poll question | option 1 | option 2", "Créer un sondage dans un groupe"],
  [".tagall", "Mentionner les membres (admin requis)"],
  [".kick @membre", "Retirer un membre (admin requis)"],
  [".promote / .demote @membre", "Gérer les admins (admin requis)"],
  [".mute / .unmute", "Fermer ou ouvrir le groupe (admin requis)"],
  [".setname / .setdesc", "Modifier les infos du groupe (admin requis)"],
  [".ia / .ai question", "Assistant IA (clé API requise)"],
  [".play / .video titre", "Recherche de liens vidéo et musique"],
  [".sticker / .s", "Créer un sticker depuis une image citée"],
  [".vv", "Renvoyer une photo, vidéo ou audio normal en vue unique"],
  [".react ❤️", "Réagir à un message cité"],
  [".anti", "Afficher les commandes de protection"],
  [".antispam on|off", "Protection basique contre les messages répétés"],
  [".kickall / .kickall2", "Désactivés par sécurité; utilise .kick @membre"],
  [".imageprompt / .animeprompt / .logoprompt / .posterprompt", "Préparer des prompts pour générateurs d’images"],
  [".iaimage description", "Créer un prompt d’image à copier dans un générateur"],
  [".antilink on/off / .antimention on/off", "Protections de groupe"],
  [".welcome on/off / .goodbye on/off", "Messages d’arrivée et de départ"],
  [".autoreact on/off", "Réaction automatique dans un groupe"],
  [".pair", "Instructions pour le code d’association"],
  [".regles / .owner", "Règles et configuration"]
];

export function parseCommand(input) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed.startsWith(".") && !trimmed.startsWith("!")) return { command: "", args: "" };
  const body = trimmed.slice(1).trim();
  if (!body) return { command: "", args: "" };
  const splitAt = body.search(/\s/);
  const rawCommand = (splitAt === -1 ? body : body.slice(0, splitAt)).toLowerCase();
  const args = splitAt === -1 ? "" : body.slice(splitAt).trim();
  const aliases = {
    calc: "calcul", groupinfo: "groupe", choose: "choisir", reverse: "inverse",
    joke: "blague", quote: "citation", roll: "de", coin: "pile", sysinfo: "diagnostic"
  };
  return { command: aliases[rawCommand] || rawCommand, args };
}
function pick(items) { return items[Math.floor(Math.random() * items.length)]; }
function formatMenu(botName) {
  return "*" + botName + " — MENU*\n\n" +
    COMMANDS.map(([name, desc]) => name + " — " + desc).join("\n") +
    "\n\nPréfixes : . ou !\n⚠️ Les commandes d’administration exigent les droits administrateur.";
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
    case "pair": return process.env.PAIRING_NUMBER ? "📱 Le code d’association est demandé au démarrage. Consulte Termux et saisis le code dans WhatsApp > Appareils connectés." : "📱 Pour utiliser le code d’association, configure PAIRING_NUMBER dans ton fichier .env local, puis redémarre. Ne publie jamais ton numéro ni ce fichier.";
    case "ping": return "🏓 Pong ! Le gestionnaire de messages répond.";
    case "info": return "🧛🏾 " + botName + "\n⚙️ Version 1.6.0\n📱 Node.js / Termux\n🧩 Préfixes . et !\n🛠️ Diagnostic, outils et commandes de groupe";
    case "correcteur": case "selftest": {
      const checks = [];
      try { checks.push(calculate("2+2") === 4); } catch { checks.push(false); }
      try { checks.push(calculate("12*(4+3)") === 84); } catch { checks.push(false); }
      checks.push(parseCommand(".ping").command === "ping", parseCommand("!menu").command === "menu");
      const passed = checks.filter(Boolean).length;
      return "🛠️ AUTO-TEST DRACULA NOSFERA\nRésultats : " + passed + "/" + checks.length + " contrôles réussis.\n" +
        (passed === checks.length ? "✅ Calculateur et analyseur de commandes OK." : "⚠️ Un contrôle a échoué : lance npm test.") +
        "\nCe test ne répare pas la connexion WhatsApp ni les dépendances.";
    }
    case "diagnostic": case "diag": {
      const m = process.memoryUsage();
      return "🩺 DIAGNOSTIC LOCAL\nNode.js : " + process.version + "\nPlateforme : " + process.platform +
        "\nUptime : " + duration(process.uptime()) + "\nMémoire RSS : " + (m.rss / 1048576).toFixed(1) + " Mo" +
        "\nHeap utilisé : " + (m.heapUsed / 1048576).toFixed(1) + " Mo\nGestionnaire de commandes : actif" +
        "\nVérifie l’état WhatsApp dans Termux. Ce diagnostic n’effectue pas de réparation automatique.";
    }
    case "calcul": case "calc": case "math":
      try { return args ? "🧮 " + args + " = *" + calculate(args) + "*" : "Utilisation : .calcul 12*(4+3)"; }
      catch (e) { return "❌ Calcul impossible : " + e.message; }
    case "owner": case "proprietaire": return process.env.OWNER_NUMBER ? "👤 Propriétaire configuré dans l’environnement." : "👤 Contact propriétaire non configuré. Aucun numéro n’est inventé ni affiché.";
    case "date": return "📅 " + new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
    case "heure": case "time": return "🕒 Heure du serveur : " + new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" }).format(now);
    case "uptime": return "⏱️ Le processus tourne depuis " + duration(process.uptime()) + ".";
    case "memoire": case "memory": { const m = process.memoryUsage(); return "🧠 Mémoire\nRSS : " + (m.rss / 1048576).toFixed(1) + " Mo\nHeap : " + (m.heapUsed / 1048576).toFixed(1) + "/" + (m.heapTotal / 1048576).toFixed(1) + " Mo"; }
    case "blague": case "joke": return pick(jokes);
    case "citation": case "quote": return "💬 " + pick(quotes);
    case "de": case "dice": return "🎲 Tu as obtenu : *" + (1 + Math.floor(Math.random() * 6)) + "*";
    case "pile": case "face": case "coin": return Math.random() < 0.5 ? "🪙 Résultat : *PILE*" : "🪙 Résultat : *FACE*";
    case "8ball": case "boule": return args ? "🎱 " + pick(["Oui, probablement !", "C’est possible.", "Les signes sont favorables.", "Pas sûr, réessaie plus tard.", "Je ne peux pas le prédire.", "Mieux vaut réfléchir encore."]) : "Utilisation : .8ball Est-ce que j’aurai de la chance ?";
    case "choisir": { const options = args.split("|").map(x => x.trim()).filter(Boolean); return options.length < 2 ? "Utilisation : .choisir pizza | attiéké | riz" : "🤔 Je choisis : *" + pick(options) + "*"; }
    case "hasard": case "random": { const p = args.split(/\s+/).map(Number); if (p.length !== 2 || !p.every(Number.isInteger) || p[0] > p[1] || p[1] - p[0] > 1000000000) return "Utilisation : .hasard 1 100"; return "🎲 Nombre choisi : *" + (Math.floor(Math.random() * (p[1] - p[0] + 1)) + p[0]) + "*"; }
    case "quiz": { const q = pick(quizzes); return "🧠 *QUIZ*\n" + q.q + "\nA) " + q.a[0] + "\nB) " + q.a[1] + "\nC) " + q.a[2] + "\nRéponds A, B ou C. (Réponse : " + ["A","B","C"][q.correct] + ")"; }
    case "inverse": return args ? [...args].reverse().join("") : "Utilisation : .inverse Bonjour";
    case "majuscules": case "upper": return args ? args.toLocaleUpperCase("fr-FR") : "Utilisation : .majuscules ton texte";
    case "minuscules": case "lower": return args ? args.toLocaleLowerCase("fr-FR") : "Utilisation : .minuscules TON TEXTE";
    case "compter": case "count": return args ? "🔢 Caractères : " + [...args].length + "\nMots : " + ((args.match(/\S+/g) || []).length) : "Utilisation : .compter un texte";
    case "emoji": return args ? "✨ " + args : "😀 😎 😂 🔥 ❤️ 🧛🏾 🎉 💯";
    case "antispam": return "Utilisation : .antispam on ou .antispam off (administrateur requis).";
    case "settings": {
      const saved = isGroup ? (context.groupSettings?.get(jid) || {}) : {};
      return "⚙️ *DRACULA NOSFERA — RÉGLAGES*\n" +
        "Préfixes : . et !\n" +
        "Anti-lien : " + (saved.antilink ? "ON" : "OFF") + "\n" +
        "Anti-mention : " + (saved.antimention ? "ON" : "OFF") + "\n" +
        "Bienvenue : " + (saved.welcome === false ? "OFF" : "ON") + "\n" +
        "Départ : " + (saved.goodbye === false ? "OFF" : "ON") + "\n" +
        "Auto-réaction : " + (saved.autoreact ? "ON" : "OFF") + "\n" +
        (isGroup ? "Réglages de ce groupe (en mémoire)." : "Pour régler un groupe, utilise les commandes dans ce groupe.");
    }
    case "password": {
      const length = args ? Number(args) : 16;
      if (!Number.isInteger(length) || length < 8 || length > 64) return "Utilisation : .password 16 (longueur de 8 à 64 caractères).";
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%_-";
      const bytes = randomBytes(length);
      return "🔐 Mot de passe généré (" + length + " caractères) :\n" + [...bytes].map(b => alphabet[b % alphabet.length]).join("");
    }
    case "uuid": return "🆔 " + randomUUID();
    case "hash": return args ? "🔏 SHA-256 : " + createHash("sha256").update(args, "utf8").digest("hex") : "Utilisation : .hash texte";
    case "base64": {
      const match = args.match(/^(encode|decode)\s+([\s\S]+)$/i);
      if (!match) return "Utilisation : .base64 encode texte ou .base64 decode texte";
      if (match[1].toLowerCase() === "encode") return Buffer.from(match[2], "utf8").toString("base64");
      if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(match[2])) return "❌ Texte Base64 invalide.";
      return Buffer.from(match[2], "base64").toString("utf8");
    }
    case "convert": {
      const m = args.match(/^(-?\d+(?:[.,]\d+)?)\s*(km|mi|kg|lb|c|f)\s+(km|mi|kg|lb|c|f)$/i);
      if (!m) return "Utilisation : .convert 10 km mi | 5 kg lb | 32 f c";
      const value = Number(m[1].replace(",", "."));
      const from = m[2].toLowerCase(), to = m[3].toLowerCase();
      const pairs = { km: "mi", mi: "km", kg: "lb", lb: "kg", c: "f", f: "c" };
      if (pairs[from] !== to) return "❌ Unités incompatibles. Utilise km/mi, kg/lb ou c/f.";
      const converted = from === "km" ? value * 0.621371 : from === "mi" ? value / 0.621371 : from === "kg" ? value * 2.20462 : from === "lb" ? value / 2.20462 : from === "c" ? value * 9 / 5 + 32 : (value - 32) * 5 / 9;
      return "🔄 " + value + " " + from.toUpperCase() + " = " + Number(converted.toFixed(2)) + " " + to.toUpperCase();
    }
    case "rps": {
      const user = args.toLowerCase().trim();
      const choices = { pierre: "pierre", rock: "pierre", papier: "papier", paper: "papier", ciseaux: "ciseaux", scissors: "ciseaux" };
      if (!choices[user]) return "Utilisation : .rps pierre, .rps papier ou .rps ciseaux";
      const mine = pick(["pierre", "papier", "ciseaux"]);
      const win = { pierre: "ciseaux", papier: "pierre", ciseaux: "papier" };
      return "✊ Toi : " + choices[user] + " | Moi : " + mine + "\n" + (choices[user] === mine ? "🤝 Égalité !" : win[choices[user]] === mine ? "🎉 Tu gagnes !" : "😈 Je gagne !");
    }
    case "fact": return "🧠 Le poulpe possède trois cœurs. Vérifie toujours les faits surprenants avant de les partager !";
    case "rate": {
      if (!args) return "Utilisation : .rate ce que tu veux noter";
      return "⭐ Je donne à *" + args.slice(0, 120) + "* la note de " + (1 + Math.floor(Math.random() * 10)) + "/10 😂 (juste pour rire)";
    }
    case "ship": {
      const names = args.split(/[|+&,]/).map(s => s.trim()).filter(Boolean);
      if (names.length !== 2) return "Utilisation : .ship prénom1 | prénom2";
      return "💞 Compatibilité imaginaire de *" + names[0].slice(0, 40) + " + " + names[1].slice(0, 40) + "* : " + Math.floor(Math.random() * 101) + "% 😂";
    }
    case "groupe": {
      if (!isGroup) return "ℹ️ Cette commande fonctionne uniquement dans un groupe.";
      const meta = await sock.groupMetadata(jid);
      return "👥 Informations du groupe\nNom : " + (meta.subject || "Sans nom") + "\nMembres : " + meta.participants.length + "\nAdministrateurs : " + meta.participants.filter(p => p.admin).length;
    }
    case "admins": case "tagadmins": case "hidetag": {
      if (!isGroup) return "ℹ️ Cette commande fonctionne uniquement dans un groupe.";
      const meta = await sock.groupMetadata(jid);
      const admins = meta.participants.filter(p => p.admin);
      if (command === "admins") return "👑 Administrateurs : " + (admins.map(p => "@" + p.id.split("@")[0]).join(" ") || "aucun") + "\nTotal : " + admins.length;
      const auth = await requireGroupAdmin(context);
      if (!auth.ok) return auth.reply;
      if (command === "tagadmins") {
        if (!admins.length) return "Aucun administrateur trouvé.";
        await sock.sendMessage(jid, { text: (args || "📢 Attention aux admins :") + "\n" + admins.map(p => "@" + p.id.split("@")[0]).join(" "), mentions: admins.map(p => p.id) }, { quoted: message });
      } else {
        await sock.sendMessage(jid, { text: args || "📢 Attention à tous !", mentions: meta.participants.map(p => p.id) }, { quoted: message });
      }
      return "";
    }
    case "poll": {
      if (!isGroup) return "ℹ️ Cette commande fonctionne uniquement dans un groupe.";
      const parts = args.split("|").map(s => s.trim()).filter(Boolean);
      if (parts.length < 3) return "Utilisation : .poll Question | option 1 | option 2 (au moins 2 options).";
      if (parts.length > 13) return "❌ Maximum 12 options.";
      await sock.sendMessage(jid, { poll: { name: parts[0].slice(0, 250), values: parts.slice(1, 13).map(s => s.slice(0, 100)), selectableCount: 1 } }, { quoted: message });
      return "";
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
      await sock.sendMessage(jid, { text: text + "\n\n" + labels, mentions }, { quoted: message });
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
    case "regles": case "rules": return "📜 Règles suggérées\n1. Respecter tout le monde.\n2. Éviter le spam.\n3. Ne pas partager les informations privées d’autrui.\n4. Demander l’accord avant de partager une photo ou un contact.\n5. Respecter les règles du groupe.";
    case "anti": return "🛡️ MENU ANTI\\n.antilink on — supprimer les liens\\n.antilink warn — avertir sans supprimer\\n.antilink off — désactiver\\n.antimention on/off\\n.antispam on/off";
    case "kickall": case "kickall2": return "⛔ Le retrait massif de tous les membres est désactivé pour éviter une expulsion accidentelle. Utilise .kick @membre pour une action ciblée.";
    case "imageprompt": case "iaimage": {
      if (!args) return "Utilisation : .imageprompt un lion royal dans une ville futuriste";
      return "🎨 PROMPT IMAGE À COPIER\\n" + args.slice(0,700) + "\\nStyle : illustration détaillée, composition cinématographique, lumière maîtrisée, couleurs harmonieuses, sujet net, arrière-plan cohérent, haute qualité, sans filigrane.\\nCette commande prépare le prompt; elle ne génère pas directement l’image.";
    }
    case "animeprompt": {
      if (!args) return "Utilisation : .animeprompt un héros africain qui contrôle la foudre";
      return "🎨 PROMPT ANIME\\nIllustration anime originale de : " + args.slice(0,700) + ". Personnage expressif, pose dynamique, décor riche, éclairage dramatique, lignes propres, cadrage vertical 4:5, sans filigrane.";
    }
    case "logoprompt": {
      if (!args) return "Utilisation : .logoprompt Univers R.M 2.0";
      return "🎨 PROMPT LOGO\\nLogo original pour : " + args.slice(0,500) + ". Silhouette nette, contraste élevé, palette de trois couleurs maximum, lisible en petite taille, composition centrée, sans éléments inutiles.";
    }
    case "posterprompt": {
      if (!args) return "Utilisation : .posterprompt affiche BD humoristique dans un marché africain";
      return "🎨 PROMPT AFFICHE\\nAffiche verticale pour : " + args.slice(0,600) + ". Hiérarchie visuelle claire, personnages expressifs, décor détaillé, composition cinématographique, couleurs vibrantes, bulles lisibles si nécessaires, sans filigrane.";
    }
    default: return "❓ Commande inconnue : " + (parsed.prefix || ".") + command + "\nTape .menu pour voir les commandes disponibles.";
  }
}
