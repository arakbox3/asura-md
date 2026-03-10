const listCommand = async (sock, msg, args) => {
    const { remoteJid } = msg.key;

    const pollButtons = [
        "🚀 PING",
        "📜 MENU",
        "🎥 VIDEO",
        "🎵 AUDIO",
        "🆘 HELP"
    ];

    try {
        
        await sock.sendMessage(remoteJid, {
            poll: {
                name: "🛡️ *ASURA MD LIST MENU*\n\n click:",
                values: pollButtons,
                selectableCount: 1 
            }
        }, { quoted: msg });

    } catch (err) {
        console.error("Poll Button Error:", err);
        await sock.sendMessage(remoteJid, { text: "errors." });
    }
};

export default listCommand;
