import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import ffmpegPath from 'ffmpeg-static';

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  // 1. മീഡിയ ഫോൾഡർ ഉണ്ടെന്ന് ഉറപ്പാക്കുന്നു
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

    // 2. തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText });

    // 3. വീഡിയോ ഡൗൺലോഡ് ചെയ്യുന്നു
    const fileName = path.join(mediaDir, `video_${Date.now()}.mp4`);

    try {
      // Render-ൽ python3 -m yt_dlp ഉപയോഗിച്ച് നിർബന്ധമായും ഡൗൺലോഡ് ചെയ്യിക്കുന്നു
      await execPromise(`python3 -m yt_dlp -f "best[ext=mp4][height<=480]" "${video.url}" -o "${fileName}"`);

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
        await sock.sendMessage(chat, { text: "❌ File download failed! File not found." });
      }
    } catch (execError) {
      console.error("Download Error:", execError);
      await sock.sendMessage(chat, { text: "Error downloading video! ❌\nMake sure yt-dlp is installed in Render Settings." });
    }

  } catch (err) {
    console.error("Main Error:", err);
    await sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
