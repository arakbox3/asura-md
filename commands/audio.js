import axios from 'axios';
import ytSearch from 'yt-search';
import fs from 'fs';
import { exec } from 'child_process';

const getAudioUrl = async (url) => {
    const headers = { 'Referer': 'https://id.ytmp3.mobi/' };
    const videoID = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
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
        await sock.sendMessage(chat, { react: { text: "🎧", key: msg.key } });

        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Video not found");

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

        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        const rawAudioUrl = await getAudioUrl(video.url);
                const inputMp3 = `./${Date.now()}_in.mp3`;
        const outputMp3 = `./${Date.now()}_out.mp3`;
        const outputOpus = `./${Date.now()}.ogg`; 

        const response = await axios.get(rawAudioUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(inputMp3, Buffer.from(response.data));
        
        // 1. Audio file (MP3)
        exec(`ffmpeg -i ${inputMp3} -map 0:a -codec:a libmp3lame -q:a 2 ${outputMp3}`, async (err) => {
            if (!err && fs.existsSync(outputMp3)) {
                await sock.sendMessage(chat, {
                    audio: fs.readFileSync(outputMp3),
                    mimetype: 'audio/mpeg',
                    ptt: false 
                }, { quoted: msg });
                fs.unlinkSync(outputMp3);
            }

            // 2. Voice Note (PTT) 
            exec(`ffmpeg -i ${inputMp3} -vn -ac 1 -c:a libopus -b:a 64k -application voip -ar 48000 -f ogg ${outputOpus}`, async (err) => {
                if (err) {
                    console.error('FFmpeg PTT Error:', err);
                } else if (fs.existsSync(outputOpus)) {
                    await sock.sendMessage(chat, {
                        audio: fs.readFileSync(outputOpus),
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true 
                    }, { quoted: msg });
                    fs.unlinkSync(outputOpus);
                }

                // Temporary file delete
                if (fs.existsSync(inputMp3)) fs.unlinkSync(inputMp3);
                await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });
            });
        });

