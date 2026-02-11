import axios from 'axios';
import ytSearch from 'yt-search';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// YouTube Downloader Function (Streaming)
const ytd = async (url) => {
    const headers = { 
        'Referer': 'https://id.ytmp3.mobi/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    let videoID;

    try {
        const parsed = new URL(url);
        if (parsed.hostname === "youtu.be") videoID = parsed.pathname.slice(1);
        else videoID = parsed.searchParams.get("v");
    } catch {
        throw new Error("Invalid YouTube URL");
    }

    if (!videoID) throw new Error("Couldn't extract video ID");

    const { data: initData } = await axios.get(
        `https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`,
        { headers }
    );
    
    const urlParam = { v: videoID, f: "mp4", _: Math.random() };
    const fullConvertUrl = `${initData.convertURL}&${new URLSearchParams(urlParam)}`;
    const { data: convertData } = await axios.get(fullConvertUrl, { headers });

    let attempts = 0;
    while (attempts < 30) {
        const { data: prog } = await axios.get(convertData.progressURL, { headers });
        if (prog.error) throw new Error("Conversion failed");
        if (prog.progress === 3) {
            return { title: prog.title, url: convertData.downloadURL };
        }
        await delay(1000);
        attempts++;
    }
    throw new Error("Timeout");
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "❌ error!" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        let videoUrl = query;

        // ലിങ്ക് അല്ല നൽകിയതെങ്കിൽ yt-search ഉപയോഗിച്ച് ലിങ്ക് കണ്ടെത്തുന്നു
        if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
            const search = await ytSearch(query);
            const video = search.videos[0];
            if (!video) throw new Error("വീഡിയോ കണ്ടെത്താനായില്ല!");
            videoUrl = video.url;
        }

        // ytd ഫംഗ്ഷൻ വഴി സ്ട്രീമിംഗ് ലിങ്ക് എടുക്കുന്നു
        const videoData = await ytd(videoUrl);

        // നേരിട്ട് സ്ട്രീം ചെയ്ത് അയക്കുന്നു
        await sock.sendMessage(chat, {
            video: { url: videoData.url },
            caption: `🎥 *${videoData.title}*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`,
            mimetype: 'video/mp4'
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ Error." }, { quoted: msg });
    }
};
