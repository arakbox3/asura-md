import yts from "yt-search";
import axios from "axios";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .Audio name or link" });
  }

  try {
    // 1. വീഡിയോ സെർച്ച് ചെയ്യുന്നു
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "audio Not Found 😢" });
    }

    const videoUrl = video.url;
    const title = video.title;

    // Design Caption
    const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎵 *TITLE:* ${title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *AGO:* ${video.ago}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // തംബ്‌നെയിൽ അയക്കുന്നു
    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);
    
    await sock.sendMessage(chat, { image: thumbBuffer, caption: captionText });

    // 2. താൽക്കാലിക ഫയൽ പാത്ത്
    const fileName = `./media/asura_${Date.now()}.mp3`;

    // 3. yt-dlp ഉപയോഗിച്ച് ഓഡിയോ എടുക്കുന്നു (Permanent Solution)
    // ഇത് MP3 ആയി തന്നെ മാറ്റുന്നതിനാൽ Play Error വരില്ല
    await execPromise(`yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 128K "${videoUrl}" -o "${fileName}"`);

    if (fs.existsSync(fileName)) {
      // 4. ഓഡിയോ അയക്കുന്നു (With AdReply Design)
      await sock.sendMessage(chat, {
        audio: fs.readFileSync(fileName),
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: 'Asura MD 👺',
            thumbnail: thumbBuffer,
            mediaType: 1,
            sourceUrl: videoUrl,
            renderLargerThumbnail: true,
          }
        }
      }, { quoted: msg });

      // 5. അയച്ച ശേഷം ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
      fs.unlinkSync(fileName);
    }

  } catch (err) {
    console.error("Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong or Server Busy! 😢" });
  }
};
