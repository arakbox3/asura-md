import yts from "yt-search";
import axios from "axios";
import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  try {
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
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText });

    try {
      //  API ഉപയോഗിക്കുന്നു
      const apiUrl = `https://api.vkrhost.workers.dev/server?url=${video.url}`;
      const response = await axios.get(apiUrl);
      
      // വീഡിയോ ഫയലിന്റെ ലിങ്ക് കണ്ടെത്തുന്നു (480p അല്ലെങ്കിൽ ഏറ്റവും നല്ലത്)
      const downloadUrl = response.data.data.find(f => f.format === "mp4" || f.ext === "mp4")?.url;

      if (downloadUrl) {
        await sock.sendMessage(chat, {
          video: { url: downloadUrl },
          mimetype: 'video/mp4',
          caption: `*${video.title}*`
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chat, { text: "❌ ഡൗൺലോഡ് ലിങ്ക് ലഭ്യമല്ല! മറ്റൊരു വീഡിയോ ശ്രമിക്കൂ." });
      }

    } catch (apiError) {
      console.error("API Error:", apiError);
      await sock.sendMessage(chat, { text: "Error downloading video! ❌\nAPI ഡൗൺലോഡിൽ പ്രശ്നമുണ്ട്." });
    }

  } catch (err) {
    console.error("Main Error:", err);
    await sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
