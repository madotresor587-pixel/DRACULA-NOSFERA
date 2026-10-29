import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { getCommandReply, parseCommand } from "./commands.js";

const BOT_NAME = "DRACULA NOSFERA";
let reconnecting = false;

function extractText(message) {
  const content = message?.message;
  return (
    content?.conversation ??
    content?.extendedTextMessage?.text ??
    content?.imageMessage?.caption ??
    content?.videoMessage?.caption ??
    content?.documentMessage?.caption ??
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

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
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
        console.log("Session déconnectée. Relance l'association WhatsApp si nécessaire.");
        return;
      }
      if (reconnecting) return;
      reconnecting = true;
      console.log("Nouvelle tentative dans 3 secondes...");
      setTimeout(() => {
        startBot().catch((error) => {
          reconnecting = false;
          console.error("Erreur de reconnexion :", error);
        });
      }, 3000);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const message of messages) {
      if (!message?.message || message.key?.fromMe) continue;
      const jid = message.key?.remoteJid;
      if (!jid || jid === "status@broadcast" || jid.endsWith("@newsletter")) continue;

      const incoming = extractText(message);
      if (!incoming.startsWith(".") && !incoming.startsWith("!")) continue;

      const parsed = parseCommand(incoming);
      if (!parsed.command) continue;

      try {
        const reply = await getCommandReply(parsed, {
          botName: BOT_NAME,
          isGroup: jid.endsWith("@g.us"),
          sock,
          jid,
          message
        });
        if (reply) await sock.sendMessage(jid, { text: reply }, { quoted: message });
      } catch (error) {
        console.error("Erreur de commande :", error);
        await sock.sendMessage(jid, {
          text: "❌ Une erreur est survenue pour cette commande. Réessaie dans un instant."
        }, { quoted: message }).catch(() => {});
      }
    }
  });
}

startBot().catch((error) => {
  console.error("❌ Impossible de démarrer le bot :", error);
  process.exitCode = 1;
});
