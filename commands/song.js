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

    // 1. തംബ്‌നെയിൽ മെസ്സേജ് അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    let audioUrl = null;

    // --- API 1: Cobalt API (Primary) ---
    try {
        const cobalt = await axios.post('https://api.cobalt.tools/api/json', {
            url: video.url,
            downloadMode: 'audio',
            audioFormat: 'mp3'
        }, { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } });
        audioUrl = cobalt.data.url;
    } catch (e) {
        console.log("Cobalt failed, trying API 2...");
    }

    // --- API 2: Izumi API (Fallback 1) ---
    if (!audioUrl) {
        try {
            const izumi = await axios.get(`https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(video.url)}&format=mp3`);
            audioUrl = izumi.data.result.download;
        } catch (e) {
            console.log("Izumi failed, trying API 3...");
        }
    }

    // --- API 3: Okatsu API (Fallback 2) ---
    if (!audioUrl) {
        try {
            const okatsu = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(video.url)}`);
            audioUrl = okatsu.data.result.mp3;
        } catch (e) {
            console.log("All APIs failed.");
        }
    }

    if (!audioUrl) throw new Error("No download link found from any API");

    // ✅ ഓഡിയോ ഫയൽ അയക്കുന്നു
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
    await sock.sendMessage(chat, { text: "⏳Loading..." });
  }
};
