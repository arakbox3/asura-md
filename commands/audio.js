import axios from 'axios';
import ytSearch from 'yt-search';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';

/**
 * Function to get the direct download link
 * Uses a third-party API to bypass YouTube restrictions
 */
const getAudioUrl = async (url) => {
    const headers = { 'Referer': 'https://id.ytmp3.mobi/' };
    const videoID = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
    
    // Initialize session with the API
    const { data: initData } = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    
    const urlParam = { v: videoID, f: 'mp3', _: Math.random() };
    const { data: convertData } = await axios.get(`${initData.convertURL}&${new URLSearchParams(urlParam)}`, { headers });
    
    return convertData.downloadURL;
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "❌ .audio name or link!" }, { quoted: msg });

    try {
        // Send loading reaction
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 1. YouTube Search
        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Video not found");

        // --- Your Custom Design Caption ---
        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
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
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        // 2. Send Thumbnail with Caption
        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        // 3. Get the direct audio URL
        const rawAudioUrl = await getAudioUrl(video.url);

        // 4. Download and send as regular MP3 File
        const response = await axios.get(rawAudioUrl, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data);

        await sock.sendMessage(chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false 
        }, { quoted: msg });

        // 5. Convert to Voice Note (PTT) using FFmpeg
        // We push chunks to a buffer to ensure it is playable on all devices
        const pttChunks = [];
        const pttStream = new PassThrough();

        ffmpeg(rawAudioUrl)
            .audioCodec('libopus')
            .toFormat('opus')
            .audioBitrate('128k')
            .on('error', (err) => console.log('FFmpeg Error:', err))
            .pipe(pttStream);

        pttStream.on('data', (chunk) => pttChunks.push(chunk));
        pttStream.on('end', async () => {
            const finalPttBuffer = Buffer.concat(pttChunks);
            await sock.sendMessage(chat, {
                audio: finalPttBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true 
            }, { quoted: msg });

            // Send success reaction
            await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });
        });

    } catch (e) {
        console.error("Audio Play Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error: Unable to process audio." }, { quoted: msg });
    }
};
