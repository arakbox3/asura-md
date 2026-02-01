import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return sock.sendMessage(chat, { text: "❌ Usage: .font [text]" });
    }

    const charMaps = {
        doubleStruck: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙🇮🇯🇰𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
        boldItalic: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛",
        sansBold: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝑳𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝒆𝗳𝒈𝗵𝗶𝒋𝒌𝒍𝗺𝗻𝒐𝒑𝗾𝗿𝘀𝒕𝘂𝒗𝘄𝘅𝘆𝘇",
        sansItalic: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧🇬𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻",
        ancientBold: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",
        handwritingBold: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃",
        monospace: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣",
        boldSerif: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳"
    };

    const numMaps = {
        doubleStruck: "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡",
        sansBold: "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵",
        monospace: "𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿",
        boldSerif: "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
    };

    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const normalNums = "0123456789";

    const styleText = (input, charMap, numMap) => {
        const cArray = Array.from(charMap);
        const nArray = Array.from(numMap || numMaps.sansBold); 

        return input.split('').map(char => {
            const charIndex = normalChars.indexOf(char);
            if (charIndex !== -1) return cArray[charIndex];

            const numIndex = normalNums.indexOf(char);
            if (numIndex !== -1) return nArray[numIndex];

            return char; 
        }).join('');
    };

    const keys = Object.keys(charMaps);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const styled = styleText(text, charMaps[key], numMaps[key]);
        
        await sock.sendMessage(chat, { text: styled }, { quoted: msg });

        // 1.5 സെക്കൻഡ് Delay
        if (i < keys.length - 1) {
            await delay(1500);
        }
    }
};
