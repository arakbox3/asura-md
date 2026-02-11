import axios from 'axios';

function extract(tag, text) {
    return text.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] || "";
}

function clean(txt = "") {
    return txt
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    await sock.sendPresenceUpdate('composing', chat);

    try {
        const query = args.length ? args.join(' ') : 'India';
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 8000
        });

        const items = data.match(/<item>([\s\S]*?)<\/item>/g);
        if (!items) {
            return sock.sendMessage(chat, { text: `❌ No news for ${query}` }, { quoted: msg });
        }

        let newsList = `📰 *Top Headlines — ${query.toUpperCase()}*\n\n`;

        for (let i = 0; i < Math.min(items.length, 12); i++) {
            const item = items[i];

            let title = clean(extract('title', item).split(' - ')[0]);
            let source = clean(extract('source', item));
            let pubDate = new Date(extract('pubDate', item)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            newsList += `${i + 1}. ${title}\n`;
            newsList += `   🗞 ${source} | 🕒 ${pubDate}\n\n`;
        }

        newsList += `> Asura-MD`;

        await sock.sendMessage(chat, { text: newsList }, { quoted: msg });
        await sock.sendMessage(chat, { react: { text: "📰", key: msg.key } });

    } catch (e) {
        console.log(e);
        await sock.sendMessage(chat, { text: "❌ News fetch failed. Try later." }, { quoted: msg });
    }
};
