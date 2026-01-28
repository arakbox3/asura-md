import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const DB_PATH = './media/asura_db.json';
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY"); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const getDB = () => {
    if (!fs.existsSync('./media')) fs.mkdirSync('./media');
    return fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) : {};
};

export const handleEvents = async (sock) => {
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const args = body.split(" ");
            const command = args[0].toLowerCase();
            const db = getDB();

            // --- 1. REMOTE CHATBOT CONTROL (.chatbot number/link) ---
            if (command === '.chatbot') {
                let target = args[1];
                let status = args[2]?.toLowerCase(); 

                if (!target || !status) {
                    return sock.sendMessage(chat, { text: "❌ *Format:* .chatbot [number/link] [on/off]" });
                }

                let targetJid;
                if (target.includes('chat.whatsapp.com')) {
                    // ഗ്രൂപ്പ് ലിങ്ക് വഴി ഐഡി എടുക്കുന്നു
                    const code = target.split('chat.whatsapp.com/')[1];
                    targetJid = await sock.groupAcceptInvite(code).catch(() => null);
                    if (!targetJid) return sock.sendMessage(chat, { text: "❌ Invalid Group Link!" });
                } else {
                    // നമ്പർ വഴി JID എടുക്കുന്നു
                    targetJid = target.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
                }

                // സേവ് ചെയ്യുന്നു
                if (!db[targetJid]) db[targetJid] = {};
                db[targetJid].chatbot = (status === 'on');
                fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

                return sock.sendMessage(chat, { text: `✅ Chatbot ${status.toUpperCase()} for: ${target}` });
            }

            // --- 2. AI CHAT LOGIC (Works in DM & Group) ---
            const isChatbotOn = db[chat]?.chatbot || false;

            if (isChatbotOn && !body.startsWith('.')) {
                await sock.sendPresenceUpdate('composing', chat);

                const result = await model.generateContent(body);
                const aiText = result.response.text();

                await sock.sendMessage(chat, { text: aiText }, { quoted: msg });
            }

        } catch (e) {
            console.error("Bot Error:", e);
        }
    });
};
