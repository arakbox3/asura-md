import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return sock.sendMessage(chat, { text: "❌ Usage: .font [text]\nExample: .font Asura" });
    }

    // ഫാൻസി ഫോണ്ടുകൾ ഉണ്ടാക്കാനുള്ള ലോജിക്
    const charMaps = {
        bold: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",
        italic: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵🇺𝘷𝘸𝘹𝘺𝘻",
        bubble: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ"
    };
    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const styleText = (input, map) => {
        return input.split('').map(char => {
            const index = normalChars.indexOf(char);
            return index !== -1 ? Array.from(map)[index] : char;
        }).join('');
    };

    let result = "";
    let count = 1;
    for (const [name, map] of Object.entries(charMaps)) {
        result += `┃ ${count++}. ${styleText(text, map)}\n`;
    }

    const fontDesign = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Font Generator*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*

╭•°•❲ *Result for: ${text}* ❳•°•
${result}     
╰╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // 1. ആദ്യം ഇമേജും ക്യാപ്ഷനും അയക്കുന്നു
    const imagePath = './media/thumb.jpg'; 
    if (fs.existsSync(imagePath)) {
        await sock.sendMessage(chat, { image: { url: imagePath }, caption: fontDesign }, { quoted: msg });
    } else {
        await sock.sendMessage(chat, { text: fontDesign }, { quoted: msg });
    }

    // 2. തുടർന്ന് media/song.opus ഫയൽ അയക്കുന്നു
    const songPath = './media/song.opus'; 
    if (fs.existsSync(songPath)) {
        await sock.sendMessage(chat, { 
            audio: { url: songPath }, 
            mimetype: 'audio/mpeg', 
            ptt: true // വോയിസ് നോട്ട് ആയി അയക്കാൻ
        }, { quoted: msg });
    }
};
