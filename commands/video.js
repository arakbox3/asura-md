import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  const mediaDir = './media';
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
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

    const fileName = path.join(mediaDir, `video_${Date.now()}.mp4`);

    try {
      // Cookies ഇല്ലാതെ വർക്ക് ആകാൻ User-Agent ചേർക്കുന്നു
      // --no-check-certificates സെർവർ എററുകൾ കുറയ്ക്കും
      const ytDlpCommand = `python3 -m yt_dlp --no-check-certificates --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36" -f "best[ext=mp4][height<=480]" "${video.url}" -o "${fileName}"`;
      
      await execPromise(ytDlpCommand);

      if (fs.existsSync(fileName)) {
        await sock.sendMessage(chat, {
          video: fs.readFileSync(fileName),
          mimetype: 'video/mp4',
          caption: `*${video.title}*`
        }, { quoted: msg });

        fs.unlinkSync(fileName);
      } else {
        await sock.sendMessage(chat, { text: "❌ File download failed! File not found." });
      }
    } catch (execError) {
      console.error("Download Error:", execError);
      await sock.sendMessage(chat, { text: "Error downloading video! ❌\nWait a moment and try again." });
    }

  } catch (err) {
    console.error("Main Error:", err);
    await sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
