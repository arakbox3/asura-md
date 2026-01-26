import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// --- 🔑 CONFIGURATION (3 API KEYS) ---
const API_KEYS = [
    "AIzaSyAjdhkNjek2l9VCm6N9upQ5L1WuZvb-CC4",
    "YOUR_GEMINI_API_KEY_2",
    "YOUR_GEMINI_API_KEY_3"
];

let currentKeyIndex = 0;

// API കീ മാറി മാറി ഉപയോഗിക്കാനുള്ള ഫംഗ്ഷൻ
const getGenAIModel = () => {
    const genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
    return genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: "You are Asura MD AI, a powerful WhatsApp assistant. Be helpful, concise, and use emojis like 👺."
    });
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(" ");
    const imagePath = './media/asura.jpg';

    if (!text) {
        return sock.sendMessage(chat, { 
            text: "*👺 ASURA MD AI ASSISTANT 👺*\n\n*Usage:* .ai [your question]\n*Example:* .ai hello" 
        }, { quoted: msg });
    }

    try {
        // Thinking Animation
        const { key } = await sock.sendMessage(chat, { text: "🔍 *Asura AI is analyzing...*" }, { quoted: msg });

        let model = getGenAIModel();
        
        try {
            const result = await model.generateContent(text);
            const response = await result.response;
            const aiResponse = response.text();

            // Final AI Response
            return sock.sendMessage(chat, { 
                text: `*👺 ASURA MD AI*\n\n${aiResponse}\n\n> © Key-Node: ${currentKeyIndex + 1}`,
                edit: key,
                contextInfo: {
                    externalAdReply: {
                        title: "ASURA INTELLIGENCE UNIT",
                        body: "Gemini Pro Multi-Node Active",
                        thumbnail: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null,
                        mediaType: 1
                    }
                }
            });
        } catch (error) {
            // കീ ലിമിറ്റ് കഴിഞ്ഞാൽ അടുത്ത കീയിലേക്ക് മാറുന്നു
            if (error.message.includes("429") || error.message.includes("quota")) {
                currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                await sock.sendMessage(chat, { text: "🔄 *Switching to Backup AI Node...*", edit: key });
                
                // വീണ്ടും ശ്രമിക്കുന്നു
                model = getGenAIModel();
                const result = await model.generateContent(text);
                const response = await result.response;
                await sock.sendMessage(chat, { text: `*👺 ASURA MD AI*\n\n${response.text()}`, edit: key });
            } else {
                throw error;
            }
        }

    } catch (e) {
        console.error(e);
        return sock.sendMessage(chat, { text: "❌ *AI Error:* All nodes are busy or API keys are invalid." });
    }
};
