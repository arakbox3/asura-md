import yts from "yt-search";
import ytdl from "@distube/ytdl-core";
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

    // 1. ഫോട്ടോയും ഡിസൈനും അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    // തംബ്‌നെയിൽ ബഫർ
    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    // --- COOKIES ഇതാ ഇവിടെ ചേർക്കുന്നു ---
    const myCookies = "VISITOR_INFO1_LIVE=; LOGIN_INFO=AFmmF2swRAIgESyWngtRkq_v4Rm9LHfq9hd8gdPLr-wbn9MtwVtRLroCIEfMpJRkIzxwuaOej-4F1rC8fAjQj-04-uZHHfElofsq:QUQ3MjNmd0RrbUlqRWZBSTVKNWlJd1hHejA4OXdESmtNei1OUVpkZHFCMTFUQ2J2UVo1UGVWMVFhUmM4QlJLZ19WZzZfREI4ODNZbGI1YUdJbDVjXzNIemRpMW1DamxHQVM2UWRUcjlWcnI4QzBjVDNSLUI5Uk5KR25PT2taNmxvQVF0c1BmM05zaGFKaHZWT1c2WlBKWFlCRU1BVVpyTGtn; HSID=AjaoR_4bigWmZzClg; SSID=AodjFMaicpK7F5-qD; APISID=HIGUf5LaHWvPxqyK/AzQZlwBvQG6Hc57MI; SAPISID=EgXOcWv9GAOGRuYv/A4VhQp8vyXE2C_TKG; __Secure-1PAPISID=EgXOcWv9GAOGRuYv/A4VhQp8vyXE2C_TKG; __Secure-3PAPISID=EgXOcWv9GAOGRuYv/A4VhQp8vyXE2C_TKG; PREF=f4=4000000&f6=40000000&tz=Asia.Calcutta; SID=g.a0005Qh05tSPrnzSclx3Fx8FevHS9DGu8X6feKcGRsOkChRdmcGfoVPL2kLaPZ4RWrvhRcfZWAACgYKAQ4SARASFQHGX2MirCZVPJNUSDdU5BNc5F2_IRoVAUF8yKqucen70rpCEKMqhPpKADxZ0076; __Secure-1PSID=g.a0005Qh05tSPrnzSclx3Fx8FevHS9DGu8X6feKcGRsOkChRdmcGfUGSlSTz9kNAQyJjl3PK7XAACgYKAQ4SARASFQHGX2MirHqDFtxuIL3854FlbVsY1hoVAUF8yKrqpUJLZWzP7OZWNo1P3l4v0076; __Secure-3PSID=g.a0005Qh05tSPrnzSclx3Fx8FevHS9DGu8X6feKcGRsOkChRdmcGfoeGGdqMAumNHw1Fpoa4KsAACgYKAYkSARASFQHGX2MiENLaUwltUiuj-jybw1vHxxoVAUF8yKojHj-RVXAWBzKMG0a4KJMg0076; SIDCC=AKEyXzWY7H0pTSiBvlrN1h6lszg6rD508I0Mx2P_fsTt64ToBnzTyN7Nc5jD_FvzSfwP2dZ8; __Secure-1PSIDCC=AKEyXzXKddJKXOFIduS0veO5S1xn4bb_TFpRCQTFcjNxEWZ6qIH_ltMdKW4ZSUh22u5vboP0ug; __Secure-3PSIDCC=AKEyXzW0v0yg8ihlHx4ZW4l5f1gbtdx-01WKzkrzT-38ZwfZpxskceYKzbdMP8CmGAtYSxHW; __Secure-1PSIDTS=sidts-CjQBflaCdbIqyx0N1hSMtPBrPv65ATb7vyX7Cjao-CTCaDtFgtr576_GoX7Lg1zv2fb0ELPYEAA; __Secure-3PSIDTS=sidts-CjQBflaCdbIqyx0N1hSMtPBrPv65ATb7vyX7Cjao-CTCaDtFgtr576_GoX7Lg1zv2fb0ELPYEAA";

    // 2. നേരിട്ട് ലിങ്ക് (URL) ജനറേറ്റ് ചെയ്യുന്നു
    const audioInfo = await ytdl.getInfo(video.url, {
        requestOptions: {
            headers: {
                cookie: myCookies,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
            }
        }
    });

    const format = ytdl.chooseFormat(audioInfo.formats, { filter: 'audioonly', quality: 'highestaudio' });
    const audioUrl = format.url;

    // ✅ ഓഡിയോ ഫയൽ
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

    // ✅ വോയിസ് നോട്ട്
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

  } catch (e) {
    console.error("Error in Song Command:", e);
    await sock.sendMessage(chat, { text: "❌ Sorry, I couldn't process that song. Cookies might be expired!" });
  }
};
