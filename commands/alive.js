import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
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
╚━━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    try {
        // 1. മെയിൻ അലൈവ് മെസ്സേജ്
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: aliveMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: aliveMsg }, { quoted: msg });
        }

        // 2. ഗ്രൂപ്പ് & ചാനൽ ലിങ്ക് പരസ്യം (എപ്പോഴും അയക്കുന്നു)
        const groupLink = "https://chat.whatsapp.com/LC3HXrnNI8J0481tjPTbtp";
        const channelLink = "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24";
        
        const adMsg = `🏮 *Join our Community:*
Stay updated with Asura MD 

🔗 *Group:* ${groupLink}

> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        await sock.sendMessage(chat, { 
            text: adMsg,
            contextInfo: {
                externalAdReply: {
                    title: "👺 ASURA MD OFFICIAL CHANNEL",
                    body: "Click to Follow our Channel! ✨",
                    mediaType: 1,
                    sourceUrl: channelLink, 
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        });

    } catch (e) {
        console.error("Alive Error:", e);
    }
};
