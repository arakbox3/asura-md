import yts from "yt-search";
import ytdl from "ytdl-core";
import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  try {
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Video Not Found 😢" });
    }

    // ഡിസൈൻ ഒട്ടും മാറ്റമില്ലാതെ നിലനിർത്തുന്നു
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
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // ആദ്യം തംബ്‌നെയിലും വിവരങ്ങളും അയക്കുന്നു
    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText }, { quoted: msg });

    const fileName = `./media/${Date.now()}.mp4`;

    // വീഡിയോ സ്ട്രീം എടുക്കുന്നു (360p അല്ലെങ്കിൽ mp4 കിട്ടാൻ വേണ്ടിയുള്ള ഫിൽട്ടർ)
    const videoStream = ytdl(video.url, {
      filter: 'handy', // വീഡിയോയും ഓഡിയോയും ഒരുമിച്ച് കിട്ടാൻ (360p/480p)
      quality: 'highest',
    });

    const fileWriter = fs.createWriteStream(fileName);
    videoStream.pipe(fileWriter);

    fileWriter.on('finish', async () => {
      // വീഡിയോ അയക്കുന്നു
      await sock.sendMessage(chat, {
        video: fs.readFileSync(fileName),
        mimetype: 'video/mp4',
        caption: `*${video.title}*`,
        headerType: 4
      }, { quoted: msg });

      // അയച്ചതിന് ശേഷം ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
    });

    videoStream.on('error', (err) => {
      console.error("YTDL Error:", err);
      sock.sendMessage(chat, { text: "Error. ❌" });
    });

  } catch (err) {
    console.error("Main Error:", err);
    await sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
