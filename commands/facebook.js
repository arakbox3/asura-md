import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const url = args[0];

    if (!url) return sock.sendMessage(chat, { text: "⚠️ Please provide a Facebook link! *Example: .facebook link*" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "📥", key: msg.key } });

        // Fdownloader API Request
        const response = await axios.post('https://fdownloader.net/api/ajaxSearch', 
            new URLSearchParams({ 'q': url, 'vt': 'facebook' }), 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        );

        const data = response.data.data;
        
        // ലിങ്കുകൾ കണ്ടുപിടിക്കുന്നു (Video/Photo)
        const videoMatch = data.match(/href=\\"(https:\/\/.*?\.mp4.*?)\\"/);
        const photoMatch = data.match(/href=\\"(https:\/\/.*?\.jpg.*?)\\"/); // ഫോട്ടോകൾ ഉണ്ടെങ്കിൽ
        const titleMatch = data.match(/<h3 class=\\"title\\">(.*?)<\/h3>/);

        const title = titleMatch ? titleMatch[1] : "Facebook Media";
        let dlUrl = videoMatch ? videoMatch[1].replace(/\\/g, '') : (photoMatch ? photoMatch[1].replace(/\\/g, '') : null);

        if (!dlUrl) throw new Error("Media link not found");

        // ബഫർ ലോജിക്
        const mediaResponse = await axios.get(dlUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(mediaResponse.data, 'utf-8');

        // Caption Design
        const caption = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Facebook Media*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *SOURCE:* Facebook
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *TYPE:* Photo/Video/Reels
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *STATUS:* Success
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // identify Media type
        if (dlUrl.includes('.mp4')) {
            await sock.sendMessage(chat, { video: buffer, caption: caption, mimetype: 'video/mp4' }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { image: buffer, caption: caption }, { quoted: msg });
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ error." }, { quoted: msg });
    }
};
