import pkg from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import pino from "pino";

const { makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = pkg;

const subBots = new Map();

// Helper to cleanup sub-bot after 24 hours
async function scheduleCleanup(number, tempSock, subSessionPath) {
    setTimeout(async () => {
        if (subBots.has(number)) {
            try {
                await tempSock.logout();
            } catch {}
            subBots.delete(number);
            fs.rmSync(subSessionPath, { recursive: true, force: true });
            console.log(`[INFO] Sub-bot ${number} session removed.`);
        }
    }, 24 * 60 * 60 * 1000); // 24 hours
}

// Load commands dynamically
const commands = new Map();

async function loadCommands() {
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        const name = file.replace(".js", "");
        const { default: cmd } = await import(`file://${path.resolve("./commands", file)}`);
        commands.set(name, cmd);
    }
    console.log("🙂 ASURA MD WHATSAPP BOT v2.0 ");
}

loadCommands();

// Main handler
export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let number = args[0]?.replace(/[^0-9]/g, "");

    if (!number) {
        return sock.sendMessage(chat, { text: "❌ *Usage:* `.pair 91xxxxxxxxxx`" }, { quoted: msg });
    }

    if (subBots.size >= 4) {
        return sock.sendMessage(chat, { text: "❌ *Limit Reached!*" });
    }

    await sock.sendMessage(chat, { text: "⏳ *Generating Pairing Code...*" });

    const subSessionPath = `./sessions/sub_${number}`;
    if (!fs.existsSync(subSessionPath)) fs.mkdirSync(subSessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(subSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    try {
        const tempSock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: ["Chrome (Linux)", "", ""]
        });

        tempSock.ev.on("creds.update", saveCreds);

        // Pairing code
        if (!tempSock.authState.creds.registered) {
            await delay(2000); // small delay for RAM optimization
            const code = await tempSock.requestPairingCode(number);

            await sock.sendMessage(chat, {
                text: `
┌────────────┐
👺 ASURA MD ᴠ2.0
└────────────┘
╭━━❐━━━━━━⪼
┇๏ _*🔯Prefixes: . , ! # $ & @*_
┇๏  *🌟_ASURA-MDMini WhatsApp Bot_ 🌟*
┇๏ *🤖_Your Personal WhatsApp Assistant_🔥* 
┇๏ *📜 _Send ".help" For Commands_* 
╰━━❑━━━━━━⪼
*╭━━〔 🤖 ASURA PAIRING 〕━━┈⊷*
┃
┃ 🔑 *YOUR CODE*
┃ \`\`\`${code.toUpperCase()}\`\`\`
┃
*╰━━━━━━━━━━━━━━━┈⊷*

*🤔 HOW TO USE:*
━━━━━━━━━━━━━━━━
1. Open WhatsApp > Settings.
2. Go to 'Linked Devices' 👉 'Link a Device'.
3. Select 'Link with phone number instead'.
4. Tap and copy the code above and paste it.
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© Pᴏᴡᴇʀᴇᴅ Bʏ 👺 ASURA-MD ♡*
`
            });
        }

                // On connection update
        tempSock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update; 

            if (connection === "open") {
                subBots.set(number, tempSock);
                await tempSock.sendMessage(tempSock.user.id, { text: "✅ *ASURA-MD Connected*." });
                scheduleCleanup(number, tempSock, subSessionPath);
            }

            if (connection === "close") {
                const status = lastDisconnect?.error?.output?.statusCode;
                // ലോഗൗട്ട് ചെയ്യുകയോ കണക്ഷൻ തകരുകയോ ചെയ്താൽ ഡാറ്റ ക്ലീൻ ചെയ്യും
                if (status === 401 || status === 408 || status === 500) { 
                    if (fs.existsSync(subSessionPath)) {
                        fs.rmSync(subSessionPath, { recursive: true, force: true });
                    }
                    subBots.delete(number);
                }
            }
        });

       // Commands listener
tempSock.ev.on("messages.upsert", async (chatUpdate) => {
    try {
        const subMsg = chatUpdate.messages?.[0];
        if (!subMsg?.message || subMsg.key.fromMe) return;

        const body = subMsg.message.conversation ||
                     subMsg.message.extendedTextMessage?.text ||
                     subMsg.message.imageMessage?.caption ||
                     subMsg.message.videoMessage?.caption || '';

        const prefix = /^[.!#$@&]/.test(body) ? body.match(/^[.!#$@&]/)[0] : '';
        if (!prefix) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        // Load commands 
        if (commands.has(commandName)) {
            const commandFile = commands.get(commandName);
            await commandFile(tempSock, subMsg, args); 
        }

    } catch (err) {
        console.error("Sub-bot Command Error:", err);
    }
});

    } catch (err) {
        console.error("Sub-bot Error:", err);
        await sock.sendMessage(chat, { text: "✋ Something went wrong. Try again..." });
    }
};



