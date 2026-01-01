import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";

export default async (sock, msg, query) => {
  const chat = msg.key.remoteJid;

  if (!query) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  try {
    // 1. വീഡിയോ സെർച്ച് ചെയ്യുന്നു
    const search = await yts(query);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Video Not Found 😢" });
    }

    const videoUrl = video.url;
    const title = video.title;
    const channel = video.author.name;
    const views = video.views;
    const date = video.ago;

    const captionText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${title}
 ⊙📺 *CHANNEL:* ${channel}
 ⊙👀 *VIEWS:* ${views}
 ⊙⏳ *AGO:* ${date}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━━━❥❥❥ 
┃ *Owner:* arun•°Cumar 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText });

    // 3. വീഡിയോ ഡൗൺലോഡ് ചെയ്യുന്നു (yt-dlp ഉപയോഗിച്ച്)
    const fileName = `video_${Date.now()}.mp4`;
    
    // Low quality (360p) ഉപയോഗിക്കുന്നത് വാട്സാപ്പിൽ വേഗത്തിൽ സെന്റ് ആകാൻ സഹായിക്കും
    exec(`yt-dlp -f "bestvideo[ext=mp4][height<=480]+bestaudio[ext=m4a]/best[ext=mp4]/best" "${videoUrl}" -o ${fileName}`, async (error) => {
      if (error) {
        console.error(error);
        return sock.sendMessage(chat, { text: "Error downloading video! ❌" });
      }

      // 4. വീഡിയോ അയക്കുന്നു
      await sock.sendMessage(chat, { 
        video: fs.readFileSync(fileName), 
        mimetype: 'video/mp4',
        caption: `*${title}*`
      });

      // ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
      fs.unlinkSync(fileName);
    });

  } catch (err) {
    console.log(err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
