import axios from 'axios';

// --- API KEYS ARRAY ---
const keys = [
    "AIzaSyBTC8HtiBgpNFAZnm_nJyH32dwiEcsVX4o",
    "AIzaSyB5Vb84o2Wrdgd2jV44dKCJa-1EgeQ6mss",
    "AIzaSyCOvyzPJ-0lrz1GResd8yWgiXy-yAuPqKU"
];

// കീ മാറി മാറി ഉപയോഗിക്കാൻ ഒരു ഇൻഡെക്സ് സെറ്റ് ചെയ്യുന്നു
let keyIndex = 0;

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!query) return sock.sendMessage(from, { 
        text: "✨ *ASURA MD  ASSISTANT*\n\nProvide a query to start. \nExample: `.Search Write a poem about rain`" 
    }, { quoted: msg });

    try {
        await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

        // ഓരോ തവണയും അടുത്ത കീ തിരഞ്ഞെടുക്കുന്നു (Round Robin logic)
        const currentKey = keys[keyIndex];
        keyIndex = (keyIndex + 1) % keys.length;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentKey}`;

        const response = await axios.post(url, {
            contents: [{ parts: [{ text: query }] }]
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.candidates) {
            const aiResponse = response.data.candidates[0].content.parts[0].text;

            // --- MODERN DESIGN UI ---
            const stylishMsg = `
╭━━〔 🤖 *ASURA MD RESPONSE* 〕━━┈⊷
┃
┃ ⚡ *Query:* ${query.length > 20 ? query.substring(0, 20) + '...' : query}
┃ 🧬 *Model:* 2.o
┃
┣━━━━━━━━━━━━━━┈⊷
┃
${aiResponse}
┃
╰━━━━━━━━━━━━━━━┈⊷
> *© ASURA SEARCH ENGINE*`;

            await sock.sendMessage(from, { 
                text: stylishMsg,
                mentions: [sender],
                contextInfo: {
                    externalAdReply: {
                        title: "ASURA MD ARTIFICIAL INTELLIGENCE",
                        body: "Powered by ASURA-MD",
                        mediaType: 1,
                        sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                        renderLargerThumbnail: true,
                        showAdAttribution: false 
                    }
                }
            }, { quoted: msg });

            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
        }

    } catch (error) {
        console.error(' Error:', error.message);
        
        // പരാജയപ്പെട്ടാൽ അടുത്ത കീ പരീക്ഷിക്കാൻ ഉപയോക്താവിനോട് ആവശ്യപ്പെടുകയോ അല്ലെങ്കിൽ ഓട്ടോമാറ്റിക് ആയി അറിയിക്കുകയോ ചെയ്യാം
        await sock.sendMessage(from, { 
            text: "⚠️ *System Busy:* Could not get response from AI. Please try again in a moment." 
        }, { quoted: msg });
        
        await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
    }
};
