import fs from 'fs';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const thumbPath = './media/thumb.jpg'; 
    const gameType = args[0] ? args[0].toLowerCase() : 'menu';

    try {
        await sock.sendMessage(from, { react: { text: "🎮", key: msg.key } });

        let resultTitle = "🎉";
        let resultBody = "🧨";
        let statusEmoji = "✨";

        // --- GAME ENGINE LOGIC ---
        if (gameType === 'dice') {
            const roll = Math.floor(Math.random() * 6) + 1;
            const dice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][roll - 1];
            resultTitle = "🎲 LUCKY DICE ROLL";
            resultBody = `The Shinobi Spirits rolled: *${roll}* ${dice}\nResult: ${roll > 3 ? 'Victory! 🏆' : 'Try Again! 💀'}`;
        } 
        else if (gameType === 'slots') {
            const icons = ['🍎', '💎', '🔥', '🌀', '⚡', '🎊'];
            const r1 = icons[Math.floor(Math.random() * icons.length)];
            const r2 = icons[Math.floor(Math.random() * icons.length)];
            const r3 = icons[Math.floor(Math.random() * icons.length)];
            resultTitle = "🎰 SHINOBI SLOTS";
            resultBody = `[ ${r1} | ${r2} | ${r3} ]\n\n${r1 === r2 && r2 === r3 ? 'JACKPOT!!! 💰' : 'Better luck next time! 🍃'}`;
        }
        else if (gameType === 'flip') {
            const coin = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
            resultTitle = "🪙 COIN FLIP";
            resultBody = `The coin landed on: *${coin}*\n${coin === 'HEADS' ? 'Fortune favors you! ☀️' : 'Shadows take you! 🌑'}`;
        }
        else {
            // --- MAIN MENU ---
            resultTitle = "🏮 SHINOBI GAME HUB";
            resultBody = `Welcome to the Arena, @${sender.split('@')[0]}!\n\n*Choose Your Path:* \n1. \`.game dice\`\n2. \`.game slots\`\n3. \`.game flip\``;
            statusEmoji = "🎋";
        }

        // --- STYLISH DESIGN UI ---
        const finalUI = `👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*┊ ✫ ${statusEmoji} 🎮*
*╰────────────────────❂*

┏━━━━━━━━━━━━━━━━━━━┓
⊙🔱 *${resultTitle}*
┗━━━━━━━━━━━━━━━━━━━┛

  ${resultBody}

┏━━━━━━━━━━━━━━━━━━━┓
⊙🔥 *PLAYER:* @${sender.split('@')[0]}
┗━━━━━━━━━━━━━━━━━━━┛

© 👺 𝐴𝑠𝑢𝑟𝑎 𝑀𝐷 ᴍɪɴɪ ʙᴏᴛ
𝑠ɪᴍᴘʟᴇ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ 𝑎𝑟𝑢𝑛.𝑐𝑢𝑚𝑎𝑟 ヅ
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        // --- SENDING PROCESS ---
        const messageOptions = {
            caption: finalUI,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MULTI-GAME SYSTEM",
                    body: "Play Unlimited Shinobi Games",
                    mediaType: 1,
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    renderLargerThumbnail: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        };

        if (fs.existsSync(thumbPath)) {
            await sock.sendMessage(from, { image: fs.readFileSync(thumbPath), ...messageOptions }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: finalUI, mentions: [sender] }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error('Game logic error:', error);
        await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
    }
};
