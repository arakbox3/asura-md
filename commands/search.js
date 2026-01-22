import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(from, { text: "🔍 *What do you want to search?*" }, { quoted: msg });

    try {
        await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

        // ഗൂഗിൾ സെർച്ച് റിസൾട്ട് നേരിട്ട് സ്ക്രാപ്പ് ചെയ്യുന്നു
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;
        
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        // ഗൂഗിളിന്റെ നോപ്പറ്റ് (Snippet) അല്ലെങ്കിൽ നോളജ് ബോക്സ് വേർതിരിച്ചെടുക്കുന്നു
        // ഇത് അഡ്വാൻസ്ഡ് ആയ ക്ലീനിംഗ് രീതിയാണ്
        const match = data.match(/<div class="BNeawe s3v9rd AP7Wnd"><div><div class="BNeawe s3v9rd AP7Wnd">(.*?)<\/div>/);
        let resultText = match ? match[1].replace(/<[^>]+>/g, '') : "Sorry, I couldn't find a quick summary for this.";

        if (resultText.length < 10) {
            // മറ്റൊരു ടാഗ് കൂടി നോക്കുന്നു
            const altMatch = data.match(/<div class="BNeawe iBp4i AP7Wnd">(.*?)<\/div>/);
            resultText = altMatch ? altMatch[1].replace(/<[^>]+>/g, '') : resultText;
        }

        // Stylish UI Design
        let searchMsg = `*👺 ASURA MD INTELLIGENCE*\n`;
        searchMsg += `*⊙────────────────────❂*\n\n`;
        searchMsg += `🔍 *Search:* ${query}\n\n`;
        searchMsg += `📝 *Result:* ${resultText}\n\n`;
        searchMsg += `⊙──────────────────────\n`;
        searchMsg += `*© ASURA MD - OFFICIAL*`;

        await sock.sendMessage(from, { text: searchMsg }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error('Search Error:', error);
        await sock.sendMessage(from, { text: "❌ Search failed! Try a different topic." });
    }
};
