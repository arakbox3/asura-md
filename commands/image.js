import gis from 'g-i-s';
import { promisify } from 'util';

const gisPromise = promisify(gis);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imageName = args.join(" ");

    if (!imageName) {
        return sock.sendMessage(chat, { text: "Please provide a name! (eg: .image Joker)" }, { quoted: msg });
    }

    try {
        const results = await gisPromise(imageName);

        if (results && results.length > 0) {
            const imagesToSend = results.slice(0, 20)
                .sort(() => 0.5 - Math.random())
                .slice(0, 5);

            for (let i = 0; i < imagesToSend.length; i++) {
                const tagMsg = `*👺⃝⃘̉̉━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────❂*
┃
┃╭╌❲ *ɪᴍᴀɢᴇ sᴇᴀʀᴄʜ* ❳
┃⊙ *Result:* ${imageName} [${i + 1}/5]
┃╰╌╌╌╌╌╌╌╌╌࿐
┃°☆°☆°☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━━━⛥❖⛥━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

                // No download 
                await sock.sendMessage(chat, { 
                    image: { url: imagesToSend[i].url }, 
                    caption: tagMsg 
                }, { quoted: msg });
                
                if (i < imagesToSend.length - 1) {
                    await delay(2000); 
                }
            }

        } else {
            await sock.sendMessage(chat, { text: "❌ No images found for: " + imageName });
        }
    } catch (err) {
        console.error("GIS Error:", err);
        await sock.sendMessage(chat, { text: "❌ Error fetching images." });
    }
};
