import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chat, { text: "🛍️ *Usage:* `.buy [product name]`\n_Example: .buy boat earphones_" }, { quoted: msg });
    }

    await sock.sendPresenceUpdate('composing', chat);

    try {
        // കുറഞ്ഞ വിലയിലുള്ള സാധനങ്ങൾക്കായി ഗൂഗിൾ ഷോപ്പിംഗ് സെർച്ച് ഉപയോഗിക്കുന്നു
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}+price+low+to+high&tbm=shop`;

        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // Product Details Extract ചെയ്യുന്നു (Regex)
        const titles = data.match(/<div class="rgna">([\s\S]*?)<\/div>/g) || [];
        const prices = data.match(/<span class="HRLx9c">([\s\S]*?)<\/span>/g) || [];
        const links = data.match(/<a href="\/url\?q=([\s\S]*?)"/g) || [];

        if (titles.length === 0) {
            return await sock.sendMessage(chat, { text: "❌ Please try again later." }, { quoted: msg });
        }

        let buyMsg = `*👺 Asura MD Smart Buyer* 🛍️\n`;
        buyMsg += `*Found best deals for:* _${query}_\n\n`;

        // ആദ്യത്തെ 3 മികച്ച ഡീലുകൾ കാണിക്കുന്നു
        for (let i = 0; i < Math.min(titles.length, 3); i++) {
            let title = titles[i].replace(/<[^>]+>/g, '').trim();
            let price = prices[i] ? prices[i].replace(/<[^>]+>/g, '').trim() : "Price Not Available";
            let rawLink = links[i].match(/\/url\?q=(.*?)&amp;/)?.[1] || "";
            let link = decodeURIComponent(rawLink);

            buyMsg += `*${i + 1}. ${title}*\n`;
            buyMsg += `💰 *Price:* ${price}\n`;
            buyMsg += `🔗 *Buy Now:* ${link}\n\n`;
        }

        buyMsg += `> *Note: Prices may change based on site offers.*\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // Modern Design Thumbnail
        await sock.sendMessage(chat, { 
            text: buyMsg,
            contextInfo: {
                externalAdReply: {
                    title: `🔥 BEST DEALS FOUND: ${query.toUpperCase()}`,
                    body: "Low price product bug search enabled! ✅",
                    mediaType: 1,
                    thumbnailUrl: "https://i.pinimg.com/736x/87/42/1d/87421d01f603a1103c8008a096c43c8d.jpg", 
                    sourceUrl: "https://www.google.com/shopping", 
                    showAdAttribution: false,
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "💰", key: msg.key } });

    } catch (e) {
        console.error("Buy Error:", e.message);
        await sock.sendMessage(chat, { text: "❌ Server Error." }, { quoted: msg });
    }
};
