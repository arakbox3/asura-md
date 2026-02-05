import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    try {
        
        await sock.sendMessage(from, { react: { text: "🤡", key: msg.key } });

        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const { setup, punchline } = response.data;
        let jokeText = `${setup} ${punchline} 👺ASURA-MD`;

        const lang = args[0] ? args[0].toLowerCase() : 'english';
        if (lang !== 'english') {
            const tr = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(jokeText)}`);
            jokeText = tr.data[0].map(s => s[0]).join("");
        }

        await sock.sendMessage(from, { text: jokeText }, { quoted: msg });

    } catch (e) {
        await sock.sendMessage(from, { text: "⚠️ Server busy!" });
    }
};
