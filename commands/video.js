import yts from "yt-search";
import ytdl from "@distube/ytdl-core";

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
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 1. ഫോട്ടോയും ഡിസൈനും അയക്കുന്നു
    await sock.sendMessage(chat, { 
      image: { url: video.thumbnail }, 
      caption: captionText 
    }, { quoted: msg });

    // 2. വീഡിയോയുടെ ഡയറക്ട് ലിങ്ക് എടുക്കുന്നു
    const info = await ytdl.getInfo(video.url);
    
    // സാധാരണ വാട്സാപ്പിന് സപ്പോർട്ട് ആകുന്ന 360p അല്ലെങ്കിൽ ഏറ്റവും നല്ല ക്വാളിറ്റി വീഡിയോ ലിങ്ക് എടുക്കുന്നു
    const format = ytdl.chooseFormat(info.formats, { 
      filter: 'videoandaudio', 
      quality: '18' // 360p mp4 (ഏറ്റവും നല്ലത് ഇതാണ്)
    });

    if (format && format.url) {
      // ✅ ഡൗൺലോഡ് ചെയ്ത് തീരാൻ നിൽക്കാതെ നേരിട്ട് URL വഴി വീഡിയോ അയക്കുന്നു
      await sock.sendMessage(chat, {
        video: { url: format.url },
        mimetype: 'video/mp4',
        caption: `*${video.title}*`
      }, { quoted: msg });
    } else {
      throw new Error("No format found");
    }

  } catch (err) {
    console.error("Main Error:", err);
    await sock.sendMessage(chat, { text: "Error! 😢" });
  }
};
