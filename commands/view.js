import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';

export default async (sock, msg) => {
    const chat = msg.key.remoteJid;
    const thumbPath = "./media/thumb.jpg";
    const caption = "> 👺ASURA MD";

    // 1. റിപ്ലൈ മെസ്സേജ് പരിശോധിക്കുന്നു
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return sock.sendMessage(chat, { text: "❌ Please reply to a *View* message!" }, { quoted: msg });

    // 2. വ്യൂ വൺസ് മെസ്സേജ് ടൈപ്പ് കണ്ടെത്തുന്നു (V1 & V2 സപ്പോർട്ട്)
    const viewOnce = quoted.viewOnceMessageV2 || quoted.viewOnceMessage;
    if (!viewOnce) return sock.sendMessage(chat, { text: "❌ This is not a *View Once* message!" }, { quoted: msg });

    try {
        // 3. മീഡിയ ഡൗൺലോഡ് ചെയ്യുന്നു (ബഫർ ആയി മാത്രം - No Saving)
        const buffer = await downloadMediaMessage(
            { message: viewOnce.message },
            'buffer',
            {},
            { 
                logger: console,
                reuploadRequest: sock.updateMediaMessage 
            }
        );

        const type = Object.keys(viewOnce.message)[0];
        const thumb = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;

        // 4. മെസ്സേജ് ടൈപ്പ് അനുസരിച്ച് തിരികെ അയക്കുന്നു
        if (type === 'imageMessage') {
            await sock.sendMessage(chat, { 
                image: buffer, 
                caption: caption,
                jpegThumbnail: thumb 
            }, { quoted: msg });

        } else if (type === 'videoMessage') {
            await sock.sendMessage(chat, { 
                video: buffer, 
                caption: caption, 
                mimetype: 'video/mp4',
                jpegThumbnail: thumb 
            }, { quoted: msg });

        } else if (type === 'audioMessage') {
            await sock.sendMessage(chat, { 
                audio: buffer, 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (e) {
        console.error("VV Error:", e);
        await sock.sendMessage(chat, { text: "❌ Failed! Media might be too old or expired." }, { quoted: msg });
    }
};
