import axios from "axios";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.status* [name]" });
  }

  try {
    // 1. Pinterest-ൽ നിന്ന് നേരിട്ട് വീഡിയോ ഡാറ്റ വലിച്ച് എടുക്കുന്നു
    // ഇതിന് പ്രത്യേകം API Key ആവശ്യമില്ല, ഇത് ബ്ലോക്ക് ആകാൻ സാധ്യത കുറവാണ്.
    const searchRes = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/?data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(searchQuery + " status video")}%22%2C%22scope%22%3A%22pins%22%2C%22page_size%22%3A1%7D%7D`);

    const pins = searchRes.data.resource_response.data.results;
    if (!pins || pins.length === 0) return sock.sendMessage(chat, { text: "❌ No Video Found!" });

    // വീഡിയോ ഫയൽ നേരിട്ട് കണ്ടെത്തുന്നു
    const videoUrl = pins[0].videos?.video_list?.V_720P?.url || pins[0].videos?.video_list?.V_HLSV3?.url;

    if (!videoUrl) {
      return sock.sendMessage(chat, { text: "❌ Video file not available for this search!" });
    }

    // നിങ്ങളുടെ അതേ ഡിസൈൻ ക്യാപ്ഷൻ
    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🎬 *Status Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Direct Sending...* ❳•°•
 ⊙🎬 *QUERY:* ${searchQuery}
 ⊙📺 *SOURCE:* 😜
 ⊙⏳ *STATUS:* 4k quality
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // ✅ ഫയൽ നേരിട്ട് അയക്കുന്നു
    await sock.sendMessage(chat, {
      video: { url: videoUrl },
      caption: infoText,
      mimetype: "video/mp4"
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ Connection error! Try again later." });
  }
};
