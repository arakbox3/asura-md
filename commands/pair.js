import pkg from "@whiskeysockets/baileys";
const { makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = pkg;
import fs from 'fs';
import pino from 'pino';
import path from 'path';

const subBots = new Map();

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let number = args[0]?.replace(/[^0-9]/g, '');

    if (!number) {
        return sock.sendMessage(chat, { text: "❌ *Usage:* `.pair 91xxxxxxxxxx`" }, { quoted: msg });
    }

    if (subBots.size >= 4) {
        return sock.sendMessage(chat, { text: "❌ *Limit Reached!* ." });
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
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });

        if (!tempSock.authState.creds.registered) {
            await delay(3000); 
            const code = await tempSock.requestPairingCode(number);
            await sock.sendMessage(chat, { text: `
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
> *© Pᴏᴡᴇʀᴇᴅ Bʏ 👺 ASURA-MD ♡* `});
        }

        tempSock.ev.on('creds.update', saveCreds);

        tempSock.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open') {
                subBots.set(number, tempSock);
                await tempSock.sendMessage(tempSock.user.id, { text: "✅ *ASURA-MD Connected*." });

                // logout 24
                setTimeout(async () => {
                    if (subBots.has(number)) {
                        await tempSock.logout();
                        subBots.delete(number);
                        fs.rmSync(subSessionPath, { recursive: true, force: true });
                    }
                }, 24 * 60 * 60 * 1000);
            }
        });

        // 🟢 commands running part 
        tempSock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const subMsg = chatUpdate.messages[0];
                if (!subMsg.message || subMsg.key.fromMe) return;

                const from = subMsg.key.remoteJid;
                const body = subMsg.message.conversation || 
                             subMsg.message.extendedTextMessage?.text || 
                             subMsg.message.imageMessage?.caption || 
                             subMsg.message.videoMessage?.caption || '';

                const prefix = /^[.!#$]/gi.test(body) ? body.match(/^[.!#$]/gi)[0] : '';
                const isCmd = body.startsWith(prefix);
                const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
                const cmdArgs = body.trim().split(/ +/).slice(1);

                if (isCmd) {
                    
                    const cmdPath = path.resolve(`./commands/${command}.js`);
                    
                    if (fs.existsSync(cmdPath)) {
                        const { default: runCommand } = await import(`file://${cmdPath}`);
                        await runCommand(tempSock, subMsg, cmdArgs);
                    }
                }
            } catch (err) {
                console.error("Sub-bot Command Error:", err);
            }
        });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "✋ Please wait..." });
    }
};
