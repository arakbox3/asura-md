import axios from 'axios';

/**
 * Myinstants-ൽ നിന്ന് ഓഡിയോ എടുക്കുന്ന ഫംഗ്ഷൻ
 */
const getAudio = async (query = '') => {
    try {
        let url;
        if (query) {
            
            url = `https://www.myinstants.com/search/?name=${encodeURIComponent(query)}`;
        } else {
            
            url = `https://www.myinstants.com/index/in/`;
        }

        const { data } = await axios.get(url);
        const audioMatches = data.match(/\/media\/sounds\/[\w.-]+\.mp3/g);
        
        if (audioMatches && audioMatches.length > 0) {
            
            const randomIndex = Math.floor(Math.random() * audioMatches.length);
            return {
                status: true,
                url: `https://www.myinstants.com${audioMatches[randomIndex]}`
            };
        }
        return { status: false };
    } catch (e) {
        console.error("Audio Fetch Error:", e);
        return { status: false };
    }
};

export default {
    name: 'audio',
    async execute(m, { args, conn }) {
        // ഉപയോക്താവ് പേര് നൽകിയിട്ടുണ്ടോ എന്ന് നോക്കുന്നു
        const query = args.join(' ');
        
        // ലോഡിംഗ് റിയാക്ഷൻ
        await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } });

        const result = await getAudio(query);

        if (result.status) {
            await conn.sendMessage(m.chat, {
                audio: { url: result.url },
                mimetype: 'audio/ogg',
                ptt: false 
            }, { quoted: m });
        } else {
            m.reply(query ? `❌ '${query}' not found.` : `❌ Error.`);
        }
    }
};
