import fs from 'fs';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // --- CONFIGURATION ---
    const myUpi = "08arun7@upi"; 
    const name = "Asura MD Admin";
    const amount = args[0] || "10";
    const thumbPath = './media/asura.jpg'; 

    // Payment Deep Link
    const payUrl = `upi://pay?pa=${myUpi}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

    try {
        await sock.sendMessage(from, { react: { text: "💸", key: msg.key } });

        // Stylish Design Box
        const payBox = `
╭━━〔 💳 *SIMPLE PAY* 〕━━┈⊷
┃
┃  👤 *Receiver:* ${name}
┃  💰 *Amount:* ₹${amount}
┃  📝 *Note:* Support Asura MD
┃
┣━━━━━━━━━━━━━━┈⊷
┃ 📍 *CLICK TO PAY NOW:*
┃ ${payUrl}
┣━━━━━━━━━━━━━━┈⊷
┃ 
┃ _Tap the link above to open_
┃ _GPay, PhonePe, or Paytm._
┃
╰━━━━━━━━━━━━━━━┈⊷
> *© ASURA MD SYSTEM*`;

        // Image Buffer തയ്യാറാക്കുന്നു
        let buffer;
        if (fs.existsSync(thumbPath)) {
            buffer = fs.readFileSync(thumbPath);
        }

        // മെസ്സേജ് അയക്കുന്നു
        await sock.sendMessage(from, { 
            text: payBox,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA QUICK PAYMENT",
                    body: `Ready to pay ₹${amount}?`,
                    mediaType: 1,
                    sourceUrl: payUrl, 
                    thumbnail: buffer,
                    renderLargerThumbnail: true, 
                    showAdAttribution: false
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error('Payment Error:', e);
        await sock.sendMessage(from, { text: "❌ Error generating payment link." });
    }
};
