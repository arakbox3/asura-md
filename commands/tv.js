import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

// --- CONFIGURATION ---
const apiId = 12938494; 
const apiHash = "bdbdfa189d74ffd44b5be4bed1a26247";
const botToken = "7599052852:AAEMW-41BN1j3FwjkTN7bUkTTcliGAt5z8A";
const channelId = "-1001891724070";

const client = new TelegramClient(new StringSession(""), apiId, apiHash, { 
    connectionRetries: 5,
    useWSS: true 
});

let isStarted = false;
let searchCache = new Map();

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const text = (msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || "").trim().toLowerCase();

    try {
        if (!isStarted) {
            await client.start({ botAuthToken: botToken });
            isStarted = true;
        }

        // --- 1. RANDOM LIST LOGIC (.tv) ---
        if (text === '.tv') {
            await sock.sendMessage(from, { text: "🎲 *Fetching random files from Asura DB...*" });

            // ചാനലിലെ അവസാനത്തെ 100 മെസേജുകൾ എടുക്കുന്നു
            const result = await client.invoke(
                new Api.messages.GetHistory({
                    peer: channelId,
                    limit: 100,
                })
            );

            // മീഡിയ ഉള്ളവ മാത്രം ഫിൽട്ടർ ചെയ്യുന്നു
            const files = result.messages.filter(m => m.media);
            
            if (files.length === 0) return sock.sendMessage(from, { text: "❌ *No files found!*" });

            // ഷഫിൾ ചെയ്ത് 15 എണ്ണം സെലക്ട് ചെയ്യുന്നു
            const shuffled = files.sort(() => 0.5 - Math.random()).slice(0, 15);
            searchCache.set(sender, shuffled);

            let listMsg = `╭─〔 *👺 ASURA MD TV* 〕─\n`;
            listMsg += `│ 🎭 *Mode:* Random Shuffle\n`;
            listMsg += `│ 🧊 *Total:* ${shuffled.length} Files\n`;
            listMsg += `╰─────────────────\n\n`;

            shuffled.forEach((m, index) => {
                let name = "Video/File";
                if (m.media.document) {
                    name = m.media.document.attributes.find(a => a instanceof Api.DocumentAttributeFilename)?.fileName || "Media File";
                }
                listMsg += `*${index + 1}* ➠ ${name}\n\n`;
            });

            listMsg += `> *Reply with number to get the file!*`;
            return await sock.sendMessage(from, { text: listMsg }, { quoted: msg });
        }

        // --- 2. STREAMING DOWNLOAD (Reply Handler) ---
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
        if (quotedMsg && quotedMsg.quotedMessage && !isNaN(text)) {
            const quotedText = quotedMsg.quotedMessage.conversation || quotedMsg.quotedMessage.extendedTextMessage?.text || "";
            
            if (quotedText.includes("ASURA MD TV")) {
                const index = parseInt(text) - 1;
                const userFiles = searchCache.get(sender);

                if (!userFiles || !userFiles[index]) return;

                const selected = userFiles[index];
                const media = selected.media;
                
                let fileName = "asura_media";
                let mimeType = "video/mp4"; // ഡിഫോൾട്ട് ആയി വീഡിയോ ആയി സെറ്റ് ചെയ്യുന്നു

                if (media.document) {
                    fileName = media.document.attributes.find(a => a instanceof Api.DocumentAttributeFilename)?.fileName || "file";
                    mimeType = media.document.mimeType;
                }

                await sock.sendMessage(from, { text: `🚀 *Asura MD is streaming your file...*` }, { quoted: msg });

                // STREAMING: ബഫർ ഉപയോഗിച്ച് ഡൗൺലോഡ് ചെയ്യുന്നു
                const buffer = await client.downloadMedia(media, {
                    workers: 16, 
                });

                await sock.sendMessage(from, {
                    document: buffer, 
                    mimetype: mimeType,
                    fileName: fileName,
                    caption: `✅ *Enjoy your video!*\n\n*© ᴀꜱᴜʀᴀ ᴍᴅ*`
                }, { quoted: msg });
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
};
