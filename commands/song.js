import yts from "yt-search";
import { exec } from "child_process";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .song <name or link>" });
  }

  try {
    // 1. സെർച്ച് ചെയ്യുന്നു
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Song Not Found 😢" });
    }

    const videoUrl = video.url;
    const title = video.title;
    const channel = video.author.name;
    const views = video.views;
    const date = video.ago;

    const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎵 *TITLE:* ${title}
 ⊙📺 *CHANNEL:* ${channel}
 ⊙👀 *VIEWS:* ${views}
 ⊙⏳ *AGO:* ${date}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText });

    // 3. ഓഡിയോ ലിങ്ക് മാത്രം എടുക്കുന്നു
    // -f "bestaudio" ഉപയോഗിച്ച് ഓഡിയോ സ്ട്രീം ലിങ്ക് മാത്രം എടുക്കുന്നു
    exec(`yt-dlp -g -f "bestaudio" "${videoUrl}"`, async (error, stdout) => {
      if (error || !stdout) {
        console.error("Audio Link Error:", error);
        return sock.sendMessage(chat, { text: "Error fetching audio link! ❌" });
      }

      const directUrl = stdout.trim();

      // 4. ഓഡിയോ നേരിട്ട് അയക്കുന്നു
      await sock.sendMessage(chat, {
        audio: { url: directUrl },
        mimetype: 'audio/mp4', // അല്ലെങ്കിൽ 'audio/mpeg'
        ptt: false // Voice note ആയി അയക്കണമെങ്കിൽ true ആക്കുക
      }, { quoted: msg });
    });

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
