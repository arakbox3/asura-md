import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const sender = msg.pushName || "User";
  
  // Path to your local image
  const imagePath = "./media/thumb.jpg"; 

  // Design Header
  const header = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🎰 *Asura MD Slot Machine*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*`;

  // First message - The "Spinning" state
  const loadingText = `${header}
╭•°•❲ *Spinning...* ❳•°•
 ⊙👤 *PLAYER:* ${sender}
 ⊙🎰 *STATUS:* [ 🔄 | 🔄 | 🔄 ]
*🎮*
╰╌╌╌╌╌╌╌╌╌╌࿐
> 🎰 Betting on your luck...`;

  // Send initial image with caption
  const sentMsg = await sock.sendMessage(chat, { 
    image: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : { url: 'https://placehold.co/600x400?text=No+Image' },
    caption: loadingText 
  });

  // Game Logic
  const items = ["🍎", "💎", "🎰", "👺", "🔥", "⭐"];
  const c1 = items[Math.floor(Math.random() * items.length)];
  const c2 = items[Math.floor(Math.random() * items.length)];
  const c3 = items[Math.floor(Math.random() * items.length)];

  let resultMessage = "";
  if (c1 === c2 && c2 === c3) {
    resultMessage = "🎊 JACKPOT! YOU WON! 🎊";
  } else if (c1 === c2 || c1 === c3 || c2 === c3) {
    resultMessage = "✨ BIG WIN! ✨";
  } else {
    resultMessage = "💀 YOU LOST! TRY AGAIN.";
  }

  // Final Design after spin
  const finalText = `${header}
╭•°•❲ *Spin Result* ❳•°•
 ⊙👤 *PLAYER:* ${sender}
 ⊙🎰 *SLOTS:* [ ${c1} | ${c2} | ${c3} ]
*🎮*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *${resultMessage}*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

  // Delay for 2 seconds then EDIT the message
  setTimeout(async () => {
    await sock.sendMessage(chat, {
      text: finalText,
      edit: sentMsg.key
    });
  }, 2000);
};
