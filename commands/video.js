import axios from "axios";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.video* [status name]" });
  }

  try {
   
    const res = await axios.get(`https://api.giftedtech.my.id/api/search/pinterestvideo?query=${encodeURIComponent(searchQuery + " status video")}`);
    
    if (!res.data || !res.data.results || res.data.results.length === 0) {
      return sock.sendMessage(chat, { text: "❌ Status Video Not Found!" });
    }

    const videoUrl = res.data.results[0].url;
    const title = res.data.results[0].title || searchQuery;

  
    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🎬 *Status Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${title}
 ⊙⏳ *TYPE:* Status Video
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // ✅ (No Download - Direct Stream)
    await sock.sendMessage(chat, {
      video: { url: videoUrl },
      caption: infoText,
      mimetype: "video/mp4",
      fileName: `status.mp4`
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ Video servers are busy. Please try again later!" });
  }
};
