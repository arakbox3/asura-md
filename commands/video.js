import yts from "yt-search";
import axios from "axios";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  try {
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) return sock.sendMessage(chat, { text: "Video Not Found 😢" });

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

    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText }, { quoted: msg });

    // --- ഡൗൺലോഡ് ചെയ്യാൻ API ഉപയോഗിക്കുന്നു ---
    const res = await axios.get(`https://api.zenkey.my.id/api/download/ytmp4?url=${video.url}&apikey=zenkey`);
    const downloadUrl = res.data.result.downloadUrl;

    if (downloadUrl) {
      await sock.sendMessage(chat, {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${video.title}.mp4`,
        caption: `*${video.title}*`
      }, { quoted: msg });
    } else {
      throw new Error("Download URL not found");
    }

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "API Error! വേറെ ലിങ്ക് പരീക്ഷിക്കൂ." });
  }
};
