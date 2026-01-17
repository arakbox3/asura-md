import fs from 'fs';
import path from 'path';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const pushName = msg.pushName || "User";
    const imagePath = './media/thumb.jpg';

    // 🕒 1. Runtime Calculation
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // 📅 2. Real-time Date & Time
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-IN', { hour12: true });

    // 👤 3. Profile Discovery
    let userBio = "No Bio Found";
    try {
        const status = await sock.fetchStatus(sender);
        userBio = status.status || "No Bio Found";
    } catch { userBio = "Privacy Protected"; }

    const temp = Math.floor(Math.random() * (35 - 24) + 24); 

    // 🏮 Design Structure
    const design = `
*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰───────────❂*
* °☆°☆°☆°☆°☆°☆°☆°☆°*
 〔  ASURA MD  𓆩ꨄ︎𓆪  〕  
 *👋 Hello, ${pushName}!*
╭─「 📟 *SYSTEM INFO* 」
│🔹 *Runtime* : ${hours}h ${minutes}m ${seconds}s
│🔹 *Owner* : arun.cumar
│🔹 *Time* : ${time}
│🔹 *Date* : ${date}
│
├─「 👤 *USER PROFILE* 」
│🔹 *Name* : ${pushName}
│🔹 *Bio* : ${userBio}
│🔹 *Number* : ${sender.split('@')[0]}
│
├─「 🌤️ *ENVIRONMENT* 」
│🔹 *Weather* : Partly Cloudy
│🔹 *Temp* : ${temp}°C
╰────────────●●►`;

    // 🔘 5. Template Message (Hydrated Buttons)
    // ശ്രദ്ധിക്കുക: Baileys-ന്റെ പുതിയ വേർഷനുകളിൽ 'viewOnceMessage' വഴിയാണ് ഇത് അയക്കേണ്ടത്
    const templateMessage = {
        viewOnceMessage: {
            message: {
                templateMessage: {
                    hydratedTemplate: {
                        imageMessage: fs.existsSync(imagePath) 
                            ? (await sock.prepareWAMessageMedia({ image: fs.readFileSync(imagePath) }, { upload: sock.waUploadToServer })).imageMessage 
                            : null,
                        hydratedContentText: design,
                        hydratedFooterText: '┋ ᴍᴀᴅᴇ ʙʏ arun cumar ༊',
                        hydratedButtons: [
                            { index: 1, quickReplyButton: { displayText: '🏓 PING', id: '.ping' } },
                            { index: 2, quickReplyButton: { displayText: '🩸 ALIVE', id: '.alive' } },
                            { index: 3, quickReplyButton: { displayText: '↩️ MAIN MENU', id: '.menu' } },
                            { index: 4, quickReplyButton: { displayText: '👤 OWNER', id: '.owner' } }
                        ]
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(chat, templateMessage, { messageId: msg.key.id });
    } catch (e) {
        console.error("Button Error:", e);
       
        await sock.sendMessage(chat, { 
            image: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : { url: 'https://placeholder.com/asura.jpg' }, 
            caption: design + "\n\n*Commands:* .ping, .alive, .menu, .owner" 
        }, { quoted: msg });
    }
};
