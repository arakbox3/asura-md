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

    // നിങ്ങളുടെ അതേ ഡിസൈൻ നിലനിർത്തുന്നു
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

    // ✅ API-യോ Cookies-ഓ ഇല്ലാതെ ytdl-core വഴി ഡൗൺലോഡ് ചെയ്യുന്നു
    const stream = ytdl(video.url, {
      quality: 'highestaudio',
      filter: 'audioonly',
    }).pipe(fs.createWriteStream(fileName));

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // തംബ്‌നെയിൽ ബഫർ ഉണ്ടാക്കുന്നു (AdReply-ക്ക് വേണ്ടി)
    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

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

    // ✅ 2. FFmpeg ഉപയോഗിച്ച് വോയിസ് നോട്ട് ഉണ്ടാക്കുന്നു
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

  } catch (e) {
    console.error(e);
    await sock.sendMessage(chat, { text: "❌ Error: YouTube സെർവർ തിരക്കിലാണ്. അല്പസമയത്തിന് ശേഷം വീണ്ടും ശ്രമിക്കൂ." });
  }
};
