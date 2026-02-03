export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const amount = args[0] || "10";
    const myUpi = "08arun7@upi";
    const name = "arun•°Cumar";

    try {
        // Reaction for a professional touch
        await sock.sendMessage(from, { react: { text: "💸", key: msg.key } });

        // UPI Payment Link (This will open payment apps directly)
        const upiLink = `upi://pay?pa=${myUpi}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

        const donateText = `
*─『 💳 ASURA MD DONATE 』─*\n\n` +
            `*Hello,* @${msg.sender.split('@')[0]}\n` +
            `Support the development of *Asura MD* by making a small donation.\n\n` +
            `*PAYMENT DETAILS*\n` +
            `━━━━━━━━━━━━━━━\n` +
            `⊙ *Payee:* ${name}\n` +
            `⊙ *Amount:* ₹${amount}.00\n` +
            `⊙ *UPI ID:* \`${myUpi}\`\n` +
            `━━━━━━━━━━━━━━━\n\n` +
            `*Click the link below to pay:*\n` +
            `_https://pay.upilink.in/pay/${myUpi}?am=${amount}_\n\n` +
            `> പണമടച്ച ശേഷം സ്ക്രീൻഷോട്ട് അയക്കുക. 🥰`;

        // Sending as a professional Text message with Mention
        await sock.sendMessage(from, {
            text: donateText,
            mentions: [msg.sender],
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD PAYMENT SYSTEM",
                    body: "Support Our Project",
                    thumbnailUrl: "https://files.catbox.moe/9e4b39.jpg", 
                    sourceUrl: upiLink,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error('Donate Error:', e);
        await sock.sendMessage(from, { text: `Payment UPI: ${myUpi}` });
    }
};
