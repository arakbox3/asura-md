import yts from "yt-search";
import axios from "axios";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const searchText = args.join(" ");

    if (!searchText) {
        return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
    }

    try {
        // 1. വീഡിയോ സെർച്ച് ചെയ്യുന്നു
        const search = await yts(searchText);
        const video = search.videos[0];

        if (!video) {
            return sock.sendMessage(chat, { text: "Video Not Found 😢" });
        }

        
        const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *AGO:* ${video.ago}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // ഇൻഫോ മെസ്സേജ് അയക്കുന്നു
        await sock.sendMessage(chat, { 
            image: { url: video.thumbnail }, 
            caption: captionText 
        }, { quoted: msg });

        let downloadUrl = null;

        // api
        const response = await axios.get(`https://api.vkrhost.com/api/y2mate?url=${encodeURIComponent(video.url)}`);
        
        let downloadUrl = response.data.links.mp4['auto'].url; 

        if (!downloadUrl) throw new Error("Link not found");
      
        await sock.sendMessage(chat, {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`,
            caption: `*🎬 ${video.title}*\n\n*👺Asura MD*`,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: '👺 Asura MD Video Downloader',
                    thumbnailUrl: video.thumbnail,
                    mediaType: 2,
                    sourceUrl: video.url
                }
            }
        }, { quoted: msg });

    } catch (err) {
        console.error("Final Error:", err);
        await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
    }
};
