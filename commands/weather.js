import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const city = args.join(' ');

    if (!city) {
        return sock.sendMessage(chat, {
            text: "📍 *Please provide a location!*\n_Example: .weather Kochi_"
        }, { quoted: msg });
    }

    try {
        await sock.sendMessage(chat, { react: { text: "☁️", key: msg.key } });

        // Weather JSON
        const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        const data = response.data;

        const current = data.current_condition[0];
        const area = data.nearest_area[0];
        const weatherDesc = current.weatherDesc[0].value;

        const getEmoji = (desc) => {
            desc = desc.toLowerCase();
            if (desc.includes("sun") || desc.includes("clear")) return "☀️";
            if (desc.includes("cloud")) return "☁️";
            if (desc.includes("rain")) return "🌧️";
            if (desc.includes("thunder")) return "⛈️";
            if (desc.includes("snow")) return "❄️";
            return "🌤️";
        };

        // ✅ Fetch weather image as buffer
        const img = await axios.get(
            `https://wttr.in/${encodeURIComponent(city)}.png`,
            { responseType: "arraybuffer" }
        );

        let weatherMsg = `╭━━〔 *WEATHER REPORT* 〕━╮\n`;
        weatherMsg += `┃ 📍 *Location:* ${area.areaName[0].value}\n`;
        weatherMsg += `┃ 🌍 *Region:* ${area.region[0].value}, ${area.country[0].value}\n`;
        weatherMsg += `┃ 🌡️ *Temp:* ${current.temp_C}°C (Feels ${current.FeelsLikeC}°C)\n`;
        weatherMsg += `┃ ${getEmoji(weatherDesc)} *Condition:* ${weatherDesc}\n`;
        weatherMsg += `┃ 💧 *Humidity:* ${current.humidity}%\n`;
        weatherMsg += `┃ 💨 *Wind:* ${current.windspeedKmph} km/h\n`;
        weatherMsg += `┃ 👁️ *Visibility:* ${current.visibility} km\n`;
        weatherMsg += `┃ ☀️ *UV Index:* ${current.uvIndex}\n`;
        weatherMsg += `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        weatherMsg += `🔗 https://wttr.in/${encodeURIComponent(city)}\n\n`;
        weatherMsg += `> © 👺Asura MD`;

        await sock.sendMessage(chat, {
            text: weatherMsg,
            contextInfo: {
                externalAdReply: {
                    title: `Weather in ${area.areaName[0].value}`,
                    body: `${weatherDesc} | ${current.temp_C}°C`,
                    thumbnail: Buffer.from(img.data), 
                    mediaType: 1,
                    sourceUrl: `https://wttr.in/${encodeURIComponent(city)}`,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: getEmoji(weatherDesc), key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, {
            text: "❌ *Location not found!*\nPlease check the city name."
        }, { quoted: msg });
    }
};
