import axios from 'axios';
import ytSearch from 'yt-search';
import ytdl from '@distube/ytdl-core';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

/* ---------------- YTMP3 METHOD ---------------- */

const getAudioUrl = async (url) => {

    const headers = {
        'Referer': 'https://id.ytmp3.mobi/',
        'User-Agent': 'Mozilla/5.0'
    };

    let videoID;
    const parsed = new URL(url);
    videoID = parsed.hostname === "youtu.be"
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v");

    const { data: initData } = await axios.get(
        `https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Date.now()}`,
        { headers }
    );

    const convertUrl = `${initData.convertURL}&v=${videoID}&f=mp3&_=${Date.now()}`;
    const { data: convertData } = await axios.get(convertUrl, { headers });

    let attempts = 0;

    while (attempts < 80) { // ⬅ increased timeout

        const { data: progress } = await axios.get(convertData.progressURL, { headers });

        if (progress.progress === 3 && progress.downloadURL)
            return progress.downloadURL;

        if (progress.progress === -1)
            throw new Error("Server conversion failed");

        await delay(2000); // ⬅ slower polling
        attempts++;
    }

    throw new Error("Timeout");
};

/* ---------------- MAIN COMMAND ---------------- */

export default async (sock, msg, args) => {

    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query)
        return sock.sendMessage(chat,
            { text: "❌ .audio name/link" },
            { quoted: msg }
        );

    try {

        await sock.sendMessage(chat, {
            react: { text: "⏳", key: msg.key }
        });

        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Not Found");

        const infoText = `
*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *CHANNEL:* ${video.author.name}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *DURATION:* ${video.timestamp}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        let inputBuffer;

        /* -------- TRY YTMP3 FIRST -------- */

        try {

            const rawAudioUrl = await getAudioUrl(video.url);

            const response = await axios.get(rawAudioUrl, {
                responseType: 'arraybuffer',
                headers: { 'Referer': 'https://id.ytmp3.mobi/' }
            });

            inputBuffer = Buffer.from(response.data);

        } catch {

            /* -------- FALLBACK TO DIRECT YTDL -------- */

            const stream = ytdl(video.url, {
                filter: 'audioonly',
                quality: 'highestaudio'
            });

            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            inputBuffer = Buffer.concat(chunks);
        }

        /* -------- FFMPEG CONVERT -------- */

        const convertAudio = () => {
            return new Promise((resolve, reject) => {

                const inputStream = new PassThrough();
                inputStream.end(inputBuffer);

                const chunks = [];

                ffmpeg(inputStream)
                    .audioBitrate(128)
                    .format('mp3')
                    .on('error', reject)
                    .on('end', () => resolve(Buffer.concat(chunks)))
                    .pipe()
                    .on('data', chunk => chunks.push(chunk));
            });
        };

        const finalBuffer = await convertAudio();

        await sock.sendMessage(chat, {
            audio: finalBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false
        }, { quoted: msg });

        await sock.sendMessage(chat, {
            react: { text: "✅", key: msg.key }
        });

    } catch (e) {

        await sock.sendMessage(chat,
            { text: "❌ error: " + e.message },
            { quoted: msg }
        );
    }
};
