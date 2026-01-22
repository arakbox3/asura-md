import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "🔍 എന്താണ് തിരയേണ്ടത്? \nExample: .Search Space" }, { quoted: msg });

    try {
        // വിക്കിപീഡിയ ഒഫീഷ്യൽ എപിഐ വഴി വിവരങ്ങൾ എടുക്കുന്നു (ഇത് ഫ്രീ ആണ്)
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        const data = response.data;

        if (data.type === 'disambiguation' || data.title === 'Not found') {
            return sock.sendMessage(chat, { text: "❌ കൃത്യമായ വിവരങ്ങൾ കണ്ടെത്താനായില്ല. ദയവായി കുറച്ചുകൂടി വ്യക്തമായി ടൈപ്പ് ചെയ്യൂ." });
        }

        let wikiMessage = `📚 *ASURA MD SEARCH ENGINE: ${data.title.toUpperCase()}*\n\n`;
        wikiMessage += `📝 *Description:* ${data.description || 'Information available'}\n\n`;
        wikiMessage += `📖 *Summary:* ${data.extract}\n\n`;
        wikiMessage += `_Source: Wikipedia_`;

        // ചിത്രം ഉണ്ടെങ്കിൽ അത് സ്ട്രീം ചെയ്യുന്നു
        if (data.thumbnail && data.thumbnail.source) {
            await sock.sendMessage(chat, { 
                image: { url: data.thumbnail.source }, 
                caption: wikiMessage 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: wikiMessage }, { quoted: msg });
        }

    } catch (e) {
        console.error("Wiki Error:", e);
        await sock.sendMessage(chat, { text: "❌ ഈ വിഷയത്തെക്കുറിച്ച് വിവരങ്ങൾ ലഭ്യമല്ല!" });
    }
};
