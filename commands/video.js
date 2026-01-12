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
        
    let videoUrl = null;

    // --- API ലെയറുകൾ (MP4) ---
    const videoApis = [
        async () => { // API 1: Cobalt
            const res = await axios.post('https://api.cobalt.tools/api/json', { url: video.url, videoQuality: '720' }, { headers: { 'Accept': 'application/json' } });
            return res.data.url;
        },
        async () => { // API 2: Siputzx
            const res = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(video.url)}`);
            return res.data.data.dl;
        },
        async () => { // API 3: Zenkey
            const res = await axios.get(`https://api.zenkey.my.id/api/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=zenkey`);
            return res.data.result.downloadUrl;
        }
    ];

    for (const getVUrl of videoApis) {
        try {
            videoUrl = await getVUrl();
            if (videoUrl) break;
        } catch (e) { console.log("Video API Layer Failed, switching..."); }
    }

    if (!videoUrl) throw new Error("All Video APIs failed");
      
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
