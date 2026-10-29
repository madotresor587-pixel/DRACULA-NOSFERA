import { Sticker, StickerTypes } from "wa-sticker-formatter";
import yts from "yt-search";

const groupFlags = new Map();
const messageRate = new Map();
const lastAutoReaction = new Map();
const recentMessages = new Map();

function flagsFor(jid, groupSettings) {
  const saved = groupSettings.get(jid) || {};
  return { antilink: false, antilinkMode: "delete", antimention: false, antispam: false, welcome: true, goodbye: true, autoreact: false, ...saved };
}
function getText(message) {
  const m = message?.message;
  return (m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption || m?.videoMessage?.caption || "").trim();
}
function isAdmin(meta, jid) {
  return Boolean(meta?.participants?.find(p => p.id === jid)?.admin);
}
function senderId(message) {
  return message?.key?.participant || message?.key?.remoteJid || "";
}
function linkFound(text) {
  return /(?:https?:\/\/|www\.|chat\.whatsapp\.com\/|t\.me\/|discord\.gg\/)\S+/i.test(text);
}
function hasMassMentions(message) {
  const ctx = message?.message?.extendedTextMessage?.contextInfo;
  return (ctx?.mentionedJid?.length || 0) >= 5;
}
async function actorIsAdmin(context) {
  if (!context.isGroup) return false;
  const meta = await context.sock.groupMetadata(context.jid);
  return isAdmin(meta, senderId(context.message));
}
export async function handleAutomation(context) {
  const { jid, isGroup, sock, message, incoming, groupSettings } = context;
  if (!isGroup) return "";
  const settings = flagsFor(jid, groupSettings);
  const text = incoming || getText(message);
  const sender = senderId(message);

  if (text.startsWith(".antilink ") || text.startsWith("!antilink ")) {
    if (!(await actorIsAdmin(context))) return "⛔ Seul un administrateur peut modifier l’anti-lien.";
    const value = text.split(/\s+/)[1]?.toLowerCase();
    if (!["on", "off", "warn"].includes(value)) return "Utilisation : .antilink on, .antilink warn ou .antilink off";
    settings.antilink = value !== "off";
    if (value === "warn") settings.antilinkMode = "warn";
    if (value === "on") settings.antilinkMode = "delete";
    groupSettings.set(jid, settings);
    return "🛡️ Anti-lien : " + (value === "off" ? "désactivé" : value === "warn" ? "mode avertissement" : "mode suppression") + " (temporaire).";
  }
  if (text.startsWith(".antispam ") || text.startsWith("!antispam ")) {
    if (!(await actorIsAdmin(context))) return "⛔ Seul un administrateur peut modifier l’anti-spam.";
    const value = text.split(/\s+/)[1]?.toLowerCase();
    if (!["on", "off"].includes(value)) return "Utilisation : .antispam on ou .antispam off";
    settings.antispam = value === "on";
    groupSettings.set(jid, settings);
    return "🛡️ Anti-spam : " + (settings.antispam ? "activé" : "désactivé") + ".";
  }
  if (text.startsWith(".antimention ") || text.startsWith("!antimention ")) {
    if (!(await actorIsAdmin(context))) return "⛔ Seul un administrateur peut modifier l’anti-mention.";
    const value = text.split(/\s+/)[1]?.toLowerCase();
    if (!["on", "off"].includes(value)) return "Utilisation : .antimention on ou .antimention off";
    settings.antimention = value === "on";
    groupSettings.set(jid, settings);
    return "🛡️ Anti-mention massive : " + (settings.antimention ? "activé (5 mentions ou plus)" : "désactivé") + ".";
  }
  if ([".welcome on", ".welcome off", "!welcome on", "!welcome off", ".goodbye on", ".goodbye off", "!goodbye on", "!goodbye off"].includes(text.toLowerCase())) {
    if (!(await actorIsAdmin(context))) return "⛔ Seul un administrateur peut modifier ce réglage.";
    const [rawCommand, value] = text.toLowerCase().split(/\s+/);
    const key = rawCommand.replace(/[.!]/, "") === "welcome" ? "welcome" : "goodbye";
    settings[key] = value === "on";
    groupSettings.set(jid, settings);
    return "👋 " + key + " : " + (settings[key] ? "activé" : "désactivé") + " (réglage temporaire).";
  }
  if (text.startsWith(".autoreact ") || text.startsWith("!autoreact ")) {
    if (!(await actorIsAdmin(context))) return "⛔ Seul un administrateur peut modifier l’auto-réaction.";
    const value = text.split(/\s+/)[1]?.toLowerCase();
    if (!["on", "off"].includes(value)) return "Utilisation : .autoreact on ou .autoreact off";
    settings.autoreact = value === "on";
    groupSettings.set(jid, settings);
    return "✨ Auto-réaction : " + (settings.autoreact ? "activée" : "désactivée") + ".";
  }

  if (settings.antilink && linkFound(text)) {
    const meta = await sock.groupMetadata(jid);
    if (!isAdmin(meta, sender)) {
      if (settings.antilinkMode === "warn") return "⚠️ Avertissement anti-lien : merci de ne pas partager de liens dans ce groupe.";
      try { await sock.sendMessage(jid, { delete: message.key }); } catch {}
      return "🔗 Lien détecté : message supprimé si WhatsApp l’a autorisé. Respecte les règles du groupe.";
    }
  }
  if (settings.antimention && hasMassMentions(message)) {
    const meta = await sock.groupMetadata(jid);
    if (!isAdmin(meta, sender)) {
      try { await sock.sendMessage(jid, { delete: message.key }); } catch {}
      return "📣 Mention massive détectée : message supprimé si WhatsApp l’a autorisé.";
    }
  }

  if (settings.antispam && text && !text.startsWith(".") && !text.startsWith("!")) {
    const spamKey = jid + ":" + sender;
    const now = Date.now();
    const history = (recentMessages.get(spamKey) || []).filter(item => now - item.time < 8000);
    history.push({ time: now, text: text.toLowerCase().trim() });
    recentMessages.set(spamKey, history);
    if (history.length >= 4 && history.slice(-4).every(item => item.text === history[history.length - 1].text)) {
      recentMessages.set(spamKey, []);
      try { await sock.sendMessage(jid, { delete: message.key }); } catch {}
      return "⚠️ Anti-spam : répétition détectée. Évite d’envoyer le même message plusieurs fois.";
    }
    if (recentMessages.size > 1000) recentMessages.clear();
  }
  if (settings.autoreact && text && !text.startsWith(".") && !text.startsWith("!")) {
    const key = jid + ":" + message.key.id;
    if (!lastAutoReaction.has(key)) {
      lastAutoReaction.set(key, true);
      const emojis = ["❤️", "😂", "🔥", "👍", "💯", "✨"];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      try { await sock.sendMessage(jid, { react: { text: emoji, key: message.key } }); } catch {}
      if (lastAutoReaction.size > 500) lastAutoReaction.clear();
    }
  }
  return "";
}

export async function onParticipantUpdate(sock, event, groupSettings) {
  if (!event?.id || !Array.isArray(event.participants)) return;
  const settings = flagsFor(event.id, groupSettings);
  let groupName = "ce groupe";
  try { groupName = (await sock.groupMetadata(event.id)).subject || groupName; } catch {}
  for (const participant of event.participants) {
    if (event.action === "add" && settings.welcome) {
      await sock.sendMessage(event.id, { text: "🎉 Bienvenue @" + participant.split("@")[0] + " dans *" + groupName + "* ! Présente-toi et lis les règles 😊", mentions: [participant] });
    } else if (event.action === "remove" && settings.goodbye) {
      await sock.sendMessage(event.id, { text: "👋 @" + participant.split("@")[0] + " a quitté le groupe. Bonne continuation !", mentions: [participant] });
    }
  }
}

function quotedMessage(context) {
  const quoted = context.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return null;
  return { key: {
    remoteJid: context.jid,
    id: context.message.message.extendedTextMessage.contextInfo.stanzaId,
    participant: context.message.message.extendedTextMessage.contextInfo.participant
  }, message: quoted };
}

export async function handleMediaCommand(parsed, context, downloadMediaMessage) {
  const { command, args } = parsed;
  if (command === "react") {
    const target = quotedMessage(context);
    if (!target) return { text: "Réponds au message à réagir puis utilise .react ❤️ (une réaction par compte et par message)." };
    const emoji = [...args.trim()][0];
    if (!emoji) return { text: "Utilisation : réponds à un message avec .react ❤️" };
    try {
      await context.sock.sendMessage(context.jid, { react: { text: emoji, key: target.key } });
      return { text: "" };
    } catch {
      return { text: "❌ WhatsApp n’a pas accepté cette réaction." };
    }
  }
  if (command === "vv" || command === "viewonce" || command === "once") {
    const target = quotedMessage(context);
    if (!target) return { text: "Utilisation : réponds à une photo, une vidéo ou un audio normal avec .vv." };

    const raw = target.message || {};
    // Respecte la confidentialité : ne re-télécharge pas et ne retransmet pas un média déjà envoyé en vue unique.
    if (raw.viewOnceMessage || raw.viewOnceMessageV2 || raw.viewOnceMessageV2Extension) {
      return { text: "🔒 Ce média est déjà en vue unique. Pour respecter la confidentialité, DRACULA NOSFERA ne le retransmet pas." };
    }
    const content = raw.ephemeralMessage?.message || raw;
    if (content.viewOnceMessage || content.viewOnceMessageV2 || content.viewOnceMessageV2Extension) {
      return { text: "🔒 Ce média est déjà en vue unique. Pour respecter la confidentialité, DRACULA NOSFERA ne le retransmet pas." };
    }
    const media = content.imageMessage || content.videoMessage || content.audioMessage;
    if (!media) return { text: "❌ Réponds à une photo, une vidéo ou un audio normal. Les documents et stickers ne sont pas pris en charge." };

    try {
      const buffer = await downloadMediaMessage(target, "buffer", {});
      if (content.imageMessage) {
        return { media: { image: buffer, caption: args || media.caption || "", viewOnce: true } };
      }
      if (content.videoMessage) {
        return { media: { video: buffer, caption: args || media.caption || "", viewOnce: true } };
      }
      return { media: {
        audio: buffer,
        mimetype: media.mimetype || "audio/ogg; codecs=opus",
        ptt: Boolean(media.ptt),
        viewOnce: true
      } };
    } catch (error) {
      return { text: "❌ Impossible de préparer ce média. Vérifie qu’il est encore disponible et réessaie." };
    }
  }
  if (["play", "song", "musique", "video"].includes(command)) {
    if (!args) return { text: "Utilisation : ." + command + " nom du morceau ou de la vidéo" };
    try {
      const result = await yts(args);
      const videos = (result.videos || []).slice(0, 5);
      if (!videos.length) return { text: "Aucun résultat trouvé. Essaie un autre titre." };
      return { text: (command === "video" ? "🎬 Résultats vidéo" : "🎵 Résultats musique") + " pour *" + args + "*\n\n" +
        videos.map((v, i) => (i + 1) + ". " + v.title + "\n" + v.url + "\nDurée : " + v.timestamp).join("\n\n") +
        "\n\nLe bot fournit des liens de recherche et ne télécharge pas les contenus protégés." };
    } catch {
      return { text: "❌ Recherche média indisponible. Vérifie la connexion internet puis réessaie." };
    }
  }
  if (["sticker", "s", "stickerly"].includes(command)) {
    const target = quotedMessage(context) || context.message;
    const media = target.message?.imageMessage || target.message?.videoMessage;
    if (!media) return { text: "Réponds à une image avec .sticker. Les vidéos/GIF nécessitent une conversion FFmpeg qui n’est pas encore activée." };
    if (media.mimetype?.startsWith("video/")) return { text: "La conversion vidéo en sticker animé nécessite FFmpeg et n’est pas encore activée dans cette version." };
    try {
      const buffer = await downloadMediaMessage(target, "buffer", {});
      const sticker = new Sticker(buffer, { pack: "DRACULA NOSFERA", author: "DRACULA NOSFERA", type: StickerTypes.FULL, quality: 70 });
      return { sticker: await sticker.toBuffer() };
    } catch (error) {
      return { text: "❌ Impossible de créer le sticker. Vérifie que le média est encore téléchargeable et que les dépendances sont installées." };
    }
  }
  if (command === "toimg") {
    return { text: "La conversion sticker → image sera ajoutée dans une prochaine version. Pour l’instant, réponds à une image avec .sticker." };
  }
  return { text: "Commande média inconnue." };
}

export async function handleAiCommand(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return "🤖 La commande IA est ajoutée, mais elle nécessite OPENAI_API_KEY dans un fichier .env local. Ne publie jamais cette clé sur GitHub.";
  if (!prompt) return "Utilisation : .ia explique-moi les éclipses";
  if (prompt.length > 4000) return "Le message est trop long. Limite-le à 4000 caractères.";
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
        max_output_tokens: 700
      }),
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI API status", response.status, detail.slice(0, 300));
      return response.status === 401 ? "❌ Clé IA refusée : vérifie OPENAI_API_KEY." : "❌ Service IA indisponible (" + response.status + ").";
    }
    const data = await response.json();
    const text = (data.output || []).flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("\n");
    return text.slice(0, 3500) || "L’IA n’a pas renvoyé de texte.";
  } catch {
    return "❌ Impossible de joindre le service IA. Vérifie internet et réessaie.";
  }
}
