import yts from "yt-search";
import axios from "axios";
import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .audio < name>" });
  }

  try {
    // 1. യൂട്യൂബ് സെർച്ച്
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Song Not Found 😢" });
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
*⊹* 🪔 *Aduio Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎵 *TITLE:* ${title}
 ⊙📺 *CHANNEL:* ${channel}
 ⊙👀 *VIEWS:* ${views}
 ⊙⏳ *AGO:* ${date}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ അയക്കുന്നു (Local image path: ./media/thumb.jpg)
    const thumbPath = "./media/thumb.jpg";
    const imageContent = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: video.thumbnail };

    await sock.sendMessage(chat, { image: imageContent, caption: captionText });

    // 3. API വഴി ഡൗൺലോഡ് ലിങ്ക് എടുക്കുന്നു
    let downloadUrl = null;

    try {
      // First try Yupra API
      const resYupra = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
      if (resYupra.data?.success && resYupra.data?.data?.download_url) {
        downloadUrl = resYupra.data.data.download_url;
      } else {
        // Fallback to Okatsu API
        const resOkatsu = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        if (resOkatsu.data?.dl) {
          downloadUrl = resOkatsu.data.dl;
        }
      }
    } catch (apiErr) {
      console.error("API Error:", apiErr);
    }

    // 4. ഓഡിയോ നേരിട്ട് അയക്കുന്നു
    if (downloadUrl) {
      await sock.sendMessage(chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        ptt: false 
      }, { quoted: msg });
    } else {
      sock.sendMessage(chat, { text: "Error: Could not fetch download link. ❌" });
    }

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
