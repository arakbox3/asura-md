export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // List of scary/prank messages
    const prankSteps = [
        "⚠️ Initializing System Override...",
        "📡 Establishing secure tunnel via port 8080...",
        "🔓 Accessing WhatsApp Database...",
        "📂 Extracting private media files...",
        "📍 Fetching real-time GPS coordinates...",
        "🔑 Bypassing Two-Step Verification...",
        "🖼️ Accessing Front Camera... [Smile for the picture!]",
        "💀 Deleting System32/Root files...",
        "📢 Broadcast: All data uploaded to Asura MD Servers.",
        "🚫 Device ID: 48x-992-B88 Blocked by Global Security."
    ];

    // Shuffle Function to ensure it's never the same
    const shuffledPrank = prankSteps.sort(() => Math.random() - 0.5);

    try {
        // Send a starting reaction
        await sock.sendMessage(chat, { react: { text: "💀", key: msg.key } });

        // First Warning
        let { key } = await sock.sendMessage(chat, { text: "🚨 *SECURITY ALERT:* Remote access detected from IP: 192.168.1.105" });

        // Loop through the shuffled steps with delays
        for (let i = 0; i < 5; i++) { // Taking 5 random steps
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec delay
            await sock.sendMessage(chat, { 
                text: `\`\`\`${shuffledPrank[i]}\`\`\``, 
                edit: key 
            });
        }

        // Final Mind-Blowing Message
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const finalMsg = `*🔥 SYSTEM COMPROMISED 🔥*\n\n` +
            `Your device has been successfully 'pwned' by *Asura MD*.\n\n` +
            `> Just kidding! It's a prank. 😂\n` +
            `> Keep calm and stay sparking! ✨`;

        await sock.sendMessage(chat, { 
            text: finalMsg,
            contextInfo: {
                externalAdReply: {
                    title: "👺 SYSTEM ERROR: 404",
                    body: "Critical Threat Detected!",
                    mediaType: 1,
                    thumbnailUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_p6vP_P351_e3O8D77I3uT8v9vO7W_6vO8g&s",
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                    showAdAttribution: false
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("Prank Error:", e);
    }
};
