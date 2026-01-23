import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(from, { text: "🔍 *എന്താണ് സെർച്ച് ചെയ്യേണ്ടത്?*\nExample: `.search Cristiano Ronaldo`" });

    try {
        await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } });

        // ഗൂഗിളിന്റെ ലൈറ്റ് വെയിറ്റ് സെർച്ച് പേജ് ഉപയോഗിക്കുന്നു
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=ml&gl=in`;

        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36'
            }
        });

        // ഗൂഗിളിലെ പ്രധാന വിവരം (Snippet) വേർതിരിച്ചെടുക്കുന്നു
        const match = data.match(/<div class="BNeawe s3v9rd AP7Wnd"><div><div class="BNeawe s3v9rd AP7Wnd">(.*?)<\/div>/);
        let result = match ? match[1].replace(/<[^>]+>/g, '') : "Result not found!";

        if (result.includes("Result not found!")) {
            const altMatch = data.match(/<div class="BNeawe iBp4i AP7Wnd">(.*?)<\/div>/);
            result = altMatch ? altMatch[1].replace(/<[^>]+>/g, '') : "No direct answer found. Try a different keyword.";
        }

        // DESIGN BOX
        const searchBox = `
╭━━〔 👺 *ASURA MD SEARCH* 〕━━┈⊷
┃
┃ 🔎 *QUERY:* ${query}
┃
┣━━━━━━━━━━━━━━┈⊷
┃
┃ ${result}
┃
╰━━━━━━━━━━━━━━━┈⊷
> *©  ASURA MD - FAST ENGINE*`;

        await sock.sendMessage(from, { 
            text: searchBox,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA LIGHTNING SEARCH",
                    body: "No API - Super Fast Result",
                    mediaType: 1,
                    sourceUrl: "https://www.google.com",
                    renderLargerThumbnail: false,
                    showAdAttribution: true
                }
            }
        }, { quoted: msg });

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: "❌ Connection error! Search failed." });
    }
};
