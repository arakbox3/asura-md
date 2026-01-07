import yts from "yt-search";
import axios from "axios";

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

    // നിങ്ങളുടെ അതേ ഡിസൈൻ ക്യാപ്ഷൻ
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

    // 1. ഫോട്ടോയും ഡിസൈനും അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    // തംബ്‌നെയിൽ ബഫർ
    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    let audioUrl = null;

    // --- API 1: Siputzx (Powerful & High Speed) ---
    try {
        const res1 = await axios.get(`https://api.siputzx.my.id/api/dwnld/ytmp3?url=${video.url}`);
        audioUrl = res1.data.data.dl; 
    } catch (e) {
        console.log("API 1 Failed");
    }

    // --- API 2: Decypher (Fallback 1) ---
    if (!audioUrl) {
        try {
            const res2 = await axios.get(`https://api.decypher.biz.id/api/download/ytmp3?url=${video.url}`);
            audioUrl = res2.data.result.downloadUrl;
        } catch (e) {
            console.log("API 2 Failed");
        }
    }

    // --- API 3: Ryzen (Fallback 2) ---
    if (!audioUrl) {
        try {
            const res3 = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${video.url}`);
            audioUrl = res3.data.url;
        } catch (e) {
            console.log("API 3 Failed");
        }
    }

    if (!audioUrl) throw new Error("All APIs failed to provide a link.");

    // ✅ ഓഡിയോ അയക്കുന്നു (സെർവറിൽ ഡൗൺലോഡ് ചെയ്യാതെ)
    await sock.sendMessage(chat, {
      audio: { url: audioUrl },
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

    // ✅ വോയിസ് നോട്ട് അയക്കുന്നു
    await sock.sendMessage(chat, {
      audio: { url: audioUrl },
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

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
  }
};
