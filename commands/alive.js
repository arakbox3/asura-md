import fs from 'fs';

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");
    const imagePath = './media/thumb.jpg'; 

    const aliveMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
*Hello! I'm Asura MD, your fastest Assistant - alive and sparkling now! ✨*

╔━━━━━━━━━━━━━❥❥❥
┃ *⊙👀status:- online 🤩*
┃ *⊙📳mode:-  public ✅*
╠━━━━━━━━━━━━━❥❥❥
┃ *⊙🫀health:-  💯%*
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    try {
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: aliveMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: aliveMsg }, { quoted: msg });
        }
    } catch (e) {
        console.error("Alive Error:", e);
    }
}; 

