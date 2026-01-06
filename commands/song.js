import yts from "yt-search";
import ytdl from "ytdl-core";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import ffmpegPath from 'ffmpeg-static';
import axios from "axios";

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name/link]" });
  }

  try {
    const search = await yts(searchQuery);
    const video = search.videos[0];
    if (!video) return sock.sendMessage(chat, { text: "❌ Song Not Found!" });

    // ഡിസൈൻ ഒട്ടും മാറ്റമില്ലാതെ നിലനിർത്തുന്നു
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

    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    if (!fs.existsSync('./media')) fs.mkdirSync('./media');
    const fileName = `./media/audio_${Date.now()}.mp3`;
    const voiceFileName = `./media/voice_${Date.now()}.opus`;

    // ⬇️ ഡൗൺലോഡ് പ്രോസസ്സ്
    const downloadVideo = () => {
      return new Promise((resolve, reject) => {
        const stream = ytdl(video.url, { quality: 'highestaudio', filter: 'audioonly' });
        const fileStream = fs.createWriteStream(fileName);
        stream.pipe(fileStream);
        fileStream.on('finish', () => resolve());
        fileStream.on('error', (err) => reject(err));
      });
    };

    await downloadVideo();

    // തംബ്‌നെയിൽ ബഫർ
    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    // ✅ 1. ഓഡിയോ അയക്കുന്നു
    if (fs.existsSync(fileName)) {
        await sock.sendMessage(chat, {
            audio: fs.readFileSync(fileName),
            mimetype: "audio/mpeg",
            fileName: `${video.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: 'Asura MD 👺',
                    thumbnail: thumbBuffer,
                    mediaType: 1,
                    sourceUrl: video.url,
                    renderLargerThumbnail: true,
                }
            }
        }, { quoted: msg });
    }

    // ✅ 2. വോയിസ് നോട്ട് കൺവർട്ട് ചെയ്ത് അയക്കുന്നു
    // FFmpeg പാത്ത് ശരിയാണെന്ന് ഉറപ്പുവരുത്തുന്നു
    try {
        await execPromise(`"${ffmpegPath}" -i "${fileName}" -c:a libopus -ar 16000 -ac 1 "${voiceFileName}"`);
        
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
                        mediaType: 1,
                        sourceUrl: video.url,
                        renderLargerThumbnail: true,
                    }
                }
            }, { quoted: msg });
            
            fs.unlinkSync(voiceFileName);
        }
    } catch (ffmpegErr) {
        console.error("FFmpeg Error:", ffmpegErr);
        // വോയിസ് നോട്ടിൽ മാത്രം എറർ വന്നാൽ ഓഡിയോ അയച്ചതുകൊണ്ട് യൂസർക്ക് പാട്ട് കിട്ടും.
    }

    if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

  } catch (e) {
    console.error(e);
    await sock.sendMessage(chat, { text: "❌ Error: ." });
  }
};

