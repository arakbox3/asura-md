import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // ടൈപ്പിംഗ് സ്റ്റാറ്റസ് കാണിക്കാൻ (Optional)
    await sock.sendPresenceUpdate('composing', chat);

    try {
        const query = args.join(' ');
        let url = query 
            ? `https://www.myinstants.com/search/?name=${encodeURIComponent(query)}`
            : `https://www.myinstants.com/index/in/`;

        // ബ്രൗസർ റിക്വസ്റ്റ് ആണെന്ന് തോന്നിപ്പിക്കാൻ Headers നിർബന്ധമാണ്
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        // MP3 ലിങ്കുകൾ Regex വഴി കണ്ടെത്തുന്നു
        const audioMatches = data.match(/\/media\/sounds\/[\w.-]+\.mp3/g);
        
        if (!audioMatches || audioMatches.length === 0) {
            return await sock.sendMessage(chat, { text: "❌ ഒന്നും കണ്ടെത്താനായില്ല!" }, { quoted: msg });
        }

        // ലഭിച്ച ലിസ്റ്റിൽ നിന്ന് ഒരെണ്ണം റാൻഡം ആയി എടുക്കുന്നു (Shuffle)
        const randomIndex = Math.floor(Math.random() * audioMatches.length);
        const finalAudioUrl = `https://www.myinstants.com${audioMatches[randomIndex]}`;

        // ഓഡിയോ അയക്കുന്നു
        await sock.sendMessage(chat, {
            audio: { url: finalAudioUrl },
            mimetype: 'audio/ogg',
            ptt: false 
        }, { quoted: msg });

        // റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: "🎧", key: msg.key } });

    } catch (e) {
        console.error("Audio Command Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error: അല്പം കഴിഞ്ഞ് ശ്രമിക്കൂ." }, { quoted: msg });
    }
};
