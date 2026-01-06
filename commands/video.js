import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import ffmpegPath from 'ffmpeg-static';

export default async (sock, msg, args) => {
  const ffmpeg = ffmpegPath; 
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
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText });

    // 3. വീഡിയോ ഡൗൺലോഡ് ചെയ്യുന്നു
    const fileName = `./media/video_${Date.now()}.mp4`;

    // Render-ൽ yt-dlp കൃത്യമായി പ്രവർത്തിക്കാൻ 'python3 -m yt_dlp' ഉപയോഗിക്കുന്നതാണ് നല്ലത്
    exec(`python3 -m yt_dlp -f "best[ext=mp4][height<=480]" "${video.url}" -o "${fileName}"`, async (error) => {
      if (error) {
        console.error("Download Error:", error);
        return sock.sendMessage(chat, { text: "Error downloading video! ❌\nMake sure yt-dlp is installed." });
      }

      // 4. വീഡിയോ അയക്കുന്നു
      if (fs.existsSync(fileName)) {
        await sock.sendMessage(chat, {
          video: fs.readFileSync(fileName),
          mimetype: 'video/mp4',
          caption: `*${video.title}*`
        }, { quoted: msg });

        // അയച്ചു കഴിഞ്ഞാൽ ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
        fs.unlinkSync(fileName);
      } else {
        sock.sendMessage(chat, { text: "❌ File download failed!" });
      }
    });

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
