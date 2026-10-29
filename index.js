import "dotenv/config";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  downloadMediaMessage
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { getCommandReply, parseCommand } from "./commands.js";
import { handleAutomation, handleMediaCommand, handleAiCommand, onParticipantUpdate } from "./features.js";

const BOT_NAME = "DRACULA NOSFERA";
let reconnecting = false;
const groupSettings = new Map();

function extractText(message) {
  const content = message?.message;
  return (
    content?.conversation ??
    content?.extendedTextMessage?.text ??
    content?.imageMessage?.caption ??
    content?.videoMessage?.caption ??
    content?.documentMessage?.caption ??
    content?.buttonsResponseMessage?.selectedButtonId ??
    content?.listResponseMessage?.singleSelectReply?.selectedRowId ??
    ""
  ).trim();
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: [BOT_NAME, "Chrome", "1.0.0"],
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  if (!state.creds.registered && process.env.PAIRING_NUMBER) {
    const phone = process.env.PAIRING_NUMBER.replace(/[^0-9]/g, "");
    if (phone.length >= 8) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(phone);
          console.log("Code d’association WhatsApp :", code);
          console.log("Saisis-le dans WhatsApp > Appareils connectés > Connecter avec un numéro de téléphone.");
        } catch (error) {
          console.error("Impossible de générer le code d’association :", error.message);
        }
      }, 2500);
    } else {
      console.error("PAIRING_NUMBER invalide : utilise l’indicatif pays suivi des chiffres, sans +.");
    }
  }

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("group-participants.update", async (event) => {
    try { await onParticipantUpdate(sock, event, groupSettings); }
    catch (error) { console.error("Erreur welcome/goodbye :", error.message); }
  });

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr && !process.env.PAIRING_NUMBER) {
      console.log("\nScanne ce QR avec WhatsApp > Appareils connectés > Connecter un appareil :\n");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "connecting") console.log("⏳ Connexion à WhatsApp...");
    if (connection === "open") {
      reconnecting = false;
      console.log(`✅ ${BOT_NAME} est connecté !`);
    }
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log("⚠️ Connexion fermée. Code :", statusCode ?? "inconnu");
      if (statusCode === DisconnectReason.loggedOut) {
        console.log("Session déconnectée. Supprime auth_info uniquement si tu veux vraiment refaire l’association.");
        return;
      }
      if (reconnecting) return;
      reconnecting = true;
      setTimeout(() => {
        reconnecting = false;
        startBot().catch((error) => console.error("Erreur de reconnexion :", error));
      }, 3000);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const message of messages) {
      if (!message?.message || message.key?.fromMe) continue;
      const jid = message.key?.remoteJid;
      if (!jid || jid === "status@broadcast" || jid.endsWith("@newsletter")) continue;
      const isGroup = jid.endsWith("@g.us");
      const incoming = extractText(message);
      const parsed = parseCommand(incoming);
      const context = { botName: BOT_NAME, isGroup, sock, jid, message, incoming, groupSettings };

      try {
        const moderationReply = await handleAutomation(context);
        if (moderationReply) {
          await sock.sendMessage(jid, { text: moderationReply }, { quoted: message });
          continue;
        }
        if (!parsed.command) continue;

        if (["ai", "ia", "ask"].includes(parsed.command)) {
          const reply = await handleAiCommand(parsed.args);
          await sock.sendMessage(jid, { text: reply }, { quoted: message });
          continue;
        }
        if (["sticker", "s", "stickerly", "toimg", "play", "video", "song", "musique", "react"].includes(parsed.command)) {
          const result = await handleMediaCommand(parsed, context, downloadMediaMessage);
          if (result?.text) await sock.sendMessage(jid, { text: result.text }, { quoted: message });
          else if (result?.sticker) await sock.sendMessage(jid, { sticker: result.sticker }, { quoted: message });
          else if (result?.image) await sock.sendMessage(jid, { image: result.image, caption: result.caption || "" }, { quoted: message });
          continue;
        }

        const reply = await getCommandReply(parsed, context);
        if (reply) await sock.sendMessage(jid, { text: reply }, { quoted: message });
      } catch (error) {
        console.error("Erreur de commande/automatisation :", error);
        await sock.sendMessage(jid, { text: "❌ La commande a échoué. Vérifie la configuration et les logs Termux." }, { quoted: message }).catch(() => {});
      }
    }
  });
}

startBot().catch((error) => {
  console.error("❌ Impossible de démarrer le bot :", error);
  process.exitCode = 1;
});
