import fs from 'fs';

// ബോട്ട് സ്റ്റാർട്ട് ചെയ്ത സമയം
const startTime = Date.now();

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } });

        // 2. ആനിമേഷൻ തുടങ്ങുന്നു
        const { key } = await sock.sendMessage(from, { text: "🚀 Checking System..." });

        const frames = [
            "📶 Analyzing Server...",
            "📡 Calculating Ping...",
            "⏳ Fetching Uptime...",
            "👺 Asura MD Engine Ready!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            await sock.sendMessage(from, { text: frame, edit: key });
        }

        // 3. ഫൈനൽ ഡാറ്റ കണക്കാക്കുന്നു
        const timestamp = Date.now();
        const ping = timestamp - (msg.messageTimestamp * 1000);
        
        const now = Date.now();
        const diff = now - startTime;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // ഇതാ നിങ്ങളുടെ അതേ ഡിസൈൻ (Syntax Fixed)
        const pingMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰────────────────❂*
*Hello! I'm Asura MD, your fastest Assistant! ✨*

╭╌❲ *ʙᴏᴛ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ* ❳
╎ ⊙ 𝙱𝚘𝚝 𝚗𝚊𝚖𝚎 : Asura MD
╎ ⊙ 𝙿𝚒𝚗𝚐    : ${ping} 𝚖𝚜
╎ ⊙ 𝚄𝚙𝚝𝚒𝚖𝚎  : ${uptimeString}
╎ ⊙ 𝙾𝚠𝚗𝚎𝚛  : arun.Cumar
╰╌╌╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 4. ഫൈനൽ ഇമേജും ഡിസൈനും അയക്കുന്നു
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(from, { 
                image: fs.readFileSync(imagePath), 
                caption: pingMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: pingMsg }, { quoted: msg });
        }

        // Animation delete 
        await sock.sendMessage(from, { delete: key });

    } catch (e) {
        console.error("Ping Error:", e);
    }
};
