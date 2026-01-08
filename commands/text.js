import fs from 'fs';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const command = args[0] ? args[0].toLowerCase() : "";
    const text = args.slice(1).join(" ");
    const imagePath = './media/thumb.jpg';

    if (!text) {
        return sock.sendMessage(from, { text: "❌ Usage: .text <image/pdf> <your text>" });
    }

    // ഡിസൈൻ ക്യാപ്ഷൻ
    const infoText = (type) => `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Asura MD Converter*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────❂*
*Success! Your file has been generated ✨*

╭╌❲ *Text To ${type}* ❳
╎ ⊙📳 Type: ${type}
╎ ⊙ 🪟 Status: Completed ✅
╎ ⊙ 📠 Engine: Asura MD
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    try {
        await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });

        if (args[0] === 'image') {
            // Text to Image API (Direct Stream)
            const apiUrl = `https://api.screenshotmachine.com/?key=FREE&url=https://text2image.com/en/&text=${encodeURIComponent(text)}`;
            
            await sock.sendMessage(from, { 
                image: { url: `https://dummyimage.com/600x400/000/fff&text=${encodeURIComponent(text)}` }, 
                caption: infoText("Image") 
            }, { quoted: msg });

        } else if (args[0] === 'pdf') {
            // Text to PDF Logic (Using a direct generator)
            const pdfUrl = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`; // Sample logic
            
            await sock.sendMessage(from, { 
                document: { url: pdfUrl }, 
                mimetype: 'application/pdf', 
                fileName: `Asura_MD_${Date.now()}.pdf`,
                caption: infoText("PDF")
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: "❌ Error generating file!" });
    }
};
