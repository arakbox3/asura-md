import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";
import axios from "axios";
import ffmpegPath from 'ffmpeg-static';

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name/link]" });
  }

  try {
    // 1. യൂട്യൂബിൽ തിരയുന്നു
    const search = await yts(searchQuery);
    const video = search.videos[0];
    if (!video) return sock.sendMessage(chat, { text: "❌ Song Not Found!" });

    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ 1️⃣ Audio 🔊
╔━━━━━━━━━━━
┃ 2️⃣ Voice 🎤
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ മെസ്സേജ് അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    // മീഡിയ ഫോൾഡർ ഉണ്ടെന്ന് ഉറപ്പാക്കുന്നു
    if (!fs.existsSync('./media')) fs.mkdirSync('./media');

    const fileName = `./media/audio_${Date.now()}.mp3`;
    const voiceFileName = `./media/voice_${Date.now()}.opus`;

    // 3. ഡൗൺലോഡ് പ്രോസസ്സ്
    try {
      // Render-ൽ yt-dlp കൃത്യമായി വർക്ക് ആകാൻ ഫുൾ പാത്ത് അല്ലെങ്കിൽ python3 -m ഉപയോഗിക്കുന്നു
      await execPromise(`python3 -m yt_dlp -x --audio-format mp3 --audio-quality 0 "${video.url}" -o "${fileName}"`);

      if (fs.existsSync(fileName)) {
        const stats = fs.statSync(fileName);
        const fileSizeMB = stats.size / (1024 * 1024);

        if (fileSizeMB > 100) {
          if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
          return sock.sendMessage(chat, { text: "❌ File is too large (Over 100MB)!" });
        }

        const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
        const thumbBuffer = Buffer.from(thumbRes.data);

        // FFmpeg-static പാത്ത് ഉപയോഗിച്ച് വോയിസ് നോട്ടിലേക്ക് മാറ്റുന്നു
        await execPromise(`${ffmpegPath} -i "${fileName}" -c:a libopus -ar 16000 -ac 1 "${voiceFileName}"`);

        // ✅ 1. ഓഡിയോ ഫയൽ അയക്കുന്നു
        await sock.sendMessage(chat, {
          audio: fs.readFileSync(fileName),
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: video.title,
              body: 'Asura MD 👺',
              thumbnail: thumbBuffer,
              thumbnailUrl: video.thumbnail,
              mediaType: 1,
              sourceUrl: video.url,
              renderLargerThumbnail: true,
            }
          }
        }, { quoted: msg });

        // ✅ 2. വോയിസ് നോട്ട് അയക്കുന്നു (PTT)
        if (fs.existsSync(voiceFileName)) {
          await sock.sendMessage(chat, {
            audio: fs.readFileSync(voiceFileName),
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            contextInfo: {
              externalAdReply: {
                title: video.title,
                body: 'Asura MD 👺',
                thumbnail: thumbBuffer,
                thumbnailUrl: video.thumbnail,
                mediaType: 1,
                sourceUrl: video.url,
                renderLargerThumbnail: true,
              }
            }
          }, { quoted: msg });
          fs.unlinkSync(voiceFileName);
        }

        fs.unlinkSync(fileName);
      } else {
         throw new Error("File not found after download");
      }
    } catch (execError) {
      console.error("Execution Error:", execError);
      return sock.sendMessage(chat, { text: `❌ Processing Error: ${execError.message}` });
    }
  } catch (e) {
    console.error("Main Error:", e);
    await sock.sendMessage(chat, { text: "❌ Something went wrong!" });
  }
};
