import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

const BOT_NAME = "DRACULA NOSFERA";
const PREFIX = ".";

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
      console.log("\nScanne ce QR depuis WhatsApp > Appareils connectés > Connecter un appareil :\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "connecting") {
      console.log("⏳ Connexion à WhatsApp...");
    }

    if (connection === "open") {
      console.log(`✅ ${BOT_NAME} est connecté !`);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log("⚠️ Connexion fermée. Code :", statusCode ?? "inconnu");

      if (statusCode === DisconnectReason.loggedOut) {
        console.log("Cette session est déconnectée. Relance l'association WhatsApp si nécessaire.");
        return;
      }

      console.log("Nouvelle tentative de connexion...");
      startBot().catch((error) => console.error("Erreur de reconnexion :", error));
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const message of messages) {
      if (!message?.message || message.key?.fromMe) continue;

      const jid = message.key?.remoteJid;
      if (!jid || jid === "status@broadcast" || jid.endsWith("@newsletter")) continue;

      const incoming = extractText(message);
      if (!incoming.startsWith(PREFIX)) continue;

      const [rawCommand] = incoming.slice(PREFIX.length).trim().split(/\s+/);
      const command = (rawCommand ?? "").toLowerCase();

      let reply;
      switch (command) {
        case "menu":
        case "help":
          reply =
            `🧛🏾 *${BOT_NAME}*\n\n` +
            `• .menu — afficher les commandes\n` +
            `• .ping — tester la réponse\n` +
            `• .info — informations du bot\n\n` +
            `Préfixe : ${PREFIX}`;
          break;
        case "ping":
          reply = "🏓 Pong ! DRACULA NOSFERA répond correctement.";
          break;
        case "info":
          reply = `🧛🏾 ${BOT_NAME}\n⚙️ Version 1.0.0\n📱 Node.js / Termux`;
          break;
        default:
          reply = `Commande inconnue. Tape .menu pour voir les commandes.`;
      }

      try {
        await sock.sendMessage(jid, { text: reply }, { quoted: message });
      } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
      }
    }
  });
}

startBot().catch((error) => {
  console.error("❌ Impossible de démarrer le bot :", error);
  process.exitCode = 1;
});
