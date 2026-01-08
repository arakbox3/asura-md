import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return sock.sendMessage(from, { text: "❌ Please provide a question!\nExample: .ai who is Cristiano Ronaldo?" });
    }

    // Thinking മെസ്സേജ് വേരിയബിൾ ആദ്യം തന്നെ ഡിക്ലയർ ചെയ്യുന്നു
    let thinkingMsg;

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

        // 2. ആനിമേഷൻ (Thinking...)
        thinkingMsg = await sock.sendMessage(from, { text: "👺 Asura MD is thinking..." });

        // 3. AI API (Universal API - Supports Malayalam & other languages)
        const response = await axios.get(`https://itzpire.com/ai/gpt-web?q=${encodeURIComponent(text)}`);
        
        // API response 
        const aiResponse = response.data.data;

        const aiMsg = `
${aiResponse}

 ⊙ 𝚀𝚞𝚎𝚛𝚢 : ${text.length > 20 ? text.substring(0, 20) + "..." : text}

> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 4. ഫൈനൽ മെസ്സേജ് എഡിറ്റ് ചെയ്ത് അയക്കുന്നു
        await sock.sendMessage(from, { 
            text: aiMsg, 
            edit: thinkingMsg.key 
        });
        
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("AI Chat Error:", e);
        const errorText = "❌ API Error! Please try again later.";
        
        if (thinkingMsg) {
            await sock.sendMessage(from, { text: errorText, edit: thinkingMsg.key });
        } else {
            await sock.sendMessage(from, { text: errorText });
        }
    }
};
