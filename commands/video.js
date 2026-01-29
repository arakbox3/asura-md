import yts from "yt-search";
import axios from "axios";

// API ഫങ്ക്ഷനുകൾ
async function getDownloadUrl(youtubeUrl) {
    try {
        // 1. ആദ്യത്തെ API (Yupra) പരീക്ഷിക്കുന്നു
        const yupraUrl = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
        const res = await axios.get(yupraUrl);
        if (res?.data?.success && res?.data?.data?.download_url) {
            return res.data.data.download_url;
        }
    } catch (e) {
        console.log("Yupra API failed, trying Okatsu...");
    }

    try {
        // 2. രണ്ടാമത്തെ API (Okatsu) പരീക്ഷിക്കുന്നു
        const okatsuUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
        const res = await axios.get(okatsuUrl);
        if (res?.data?.result?.mp4) {
            return res.data.result.mp4;
        }
    } catch (e) {
        console.error("Both APIs failed");
    }
    return null;
}

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

        const videoUrl = video.url;
        const title = video.title;
        const channel = video.author.name;
        const views = video.views;
        const date = video.ago;

        const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *CHANNEL:* ${channel}
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *VIEWS:* ${views}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *AGO:* ${date}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 2. തംബ്‌നെയിൽ അയക്കുന്നു (അതേ ഡിസൈനിൽ)
        await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText });

        // 3. API വഴി ഡയറക്ട് ഡൗൺലോഡ് ലിങ്ക് എടുക്കുന്നു
        const directDownloadLink = await getDownloadUrl(videoUrl);

        if (!directDownloadLink) {
            return sock.sendMessage(chat, { text: "Error: Unable to fetch download link from APIs! ❌" });
        }

        // 4. വീഡിയോ സ്ട്രീമിംഗ് ആയി നേരിട്ട് അയക്കുന്നു
        await sock.sendMessage(chat, {
            video: { url: directDownloadLink },
            mimetype: 'video/mp4',
            caption: `*${title}*`
        }, { quoted: msg });

    } catch (err) {
        console.error("Main Error:", err);
        sock.sendMessage(chat, { text: "Something went wrong! 😢" });
    }
};
