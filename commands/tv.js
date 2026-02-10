import axios from "axios";
import fs from "fs";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const movieName = args.join(" ");

    if (!movieName) {
        return sock.sendMessage(chat, { text: "❌ Usage: .tv Leo" }, { quoted: msg });
    }

    try {
        // ഒരൊറ്റ ഹെഡർ മാത്രം മതി, ബ്രൗസർ ആണെന്ന് ഐഎംഡിബിയെ വിശ്വസിപ്പിക്കാൻ
        const headers = { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        };

        // 1. മൂവി സെർച്ച് ചെയ്യുന്നു
        const searchRes = await axios.get(
            `https://www.imdb.com/find?q=${encodeURIComponent(movieName)}&s=tt&ttype=ft`,
            { headers }
        );

        const idMatch = searchRes.data.match(/\/title\/(tt\d+)\//);
        if (!idMatch) throw new Error("Movie not found");

        const imdbID = idMatch[1];

        // 2. മൂവി പേജ് തുറക്കുന്നു
        const movieRes = await axios.get(
            `https://www.imdb.com/title/${imdbID}/`,
            { headers }
        );

        // 3. അതിൽ നിന്ന് വിവരങ്ങൾ അടങ്ങിയ JSON എടുക്കുന്നു
        const jsonMatch = movieRes.data.match(
            /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
        );

        if (!jsonMatch) throw new Error("Data not found");
        const data = JSON.parse(jsonMatch[1]);

        // വിവരങ്ങൾ വേർതിരിക്കുന്നു
        const title = data.name || "N/A";
        const year = data.datePublished ? data.datePublished.split("-")[0] : "N/A";
        const rating = data.aggregateRating ? data.aggregateRating.ratingValue : "N/A";
        const votes = data.aggregateRating ? data.aggregateRating.ratingCount : "N/A";
        const runtime = data.duration ? data.duration.replace("PT", "").toLowerCase() : "N/A";
        const genre = Array.isArray(data.genre) ? data.genre.join(", ") : (data.genre || "N/A");
        const plot = data.description || "N/A";
        const poster = data.image || "https://i.imgur.com/8Nf9Xp0.jpeg";
        const cast = data.actor ? data.actor.map(a => a.name).slice(0, 5).join(", ") : "N/A";
        const director = data.director ? data.director.map(d => d.name).join(", ") : "N/A";

        const movieInfo = `
🎬 *M O V I E  I N F O* 🎭
╭━❐━━━━━━━━━━⪼
├⊙ 🎥 *Title:* ${title}
├⊙ 📅 *Year:* ${year}
├⊙ ⏳ *Runtime:* ${runtime}
├⊙ 🎭 *Genre:* ${genre}
├⊙ 🌟 *IMDb Rating:* ⭐ ${rating}/10
├⊙ 🗳️ *Votes:* ${votes}
├⊙ 🎬 *Director:* ${director}
├⊙ 👥 *Cast:* ${cast}
├⊙ 📖 *Plot:* ${plot}
├⊙ 🔗 *IMDb:* https://www.imdb.com/title/${imdbID}
├⊙ 🔗 *Watch:* https://vidsrc.ru/embed/movie/${imdbID}
╰━❐━━━━━━━━━━⪼
© ASURA-MD 👺`;

        
        await sock.sendMessage(chat, {
            image: { url: poster },
            caption: movieInfo
        }, { quoted: msg });

        
        if (fs.existsSync('./media/song.opus')) {
            await sock.sendMessage(chat, {
                audio: fs.readFileSync('./media/song.opus'),
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });
        }

    } catch (err) {
        console.error(err);
        await sock.sendMessage(chat, { text: "❌ Movie not found or server busy!" }, { quoted: msg });
    }
};
