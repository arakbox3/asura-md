const listCommand = async (sock, msg, args) => {
    const { remoteJid } = msg.key;

    const sections = [
        {
            title: "🌟 Main Commands",
            highlight_label: "Popular", // ഓപ്ഷണൽ
            rows: [
                { header: "Ping", title: "Bot Speed", id: ".ping", description: "Check bot latency" },
                { header: "Menu", title: "Show All Menu", id: ".menu", description: "View all commands" },
                { header: "Help", title: "Support", id: ".help", description: "Get help" }
            ]
        },
        {
            title: "📥 Downloader & Tools",
            rows: [
                { header: "Video", title: "Video Downloader", id: ".video", description: "Download trending videos" },
                { header: "Audio", title: "Audio Downloader", id: ".audio", description: "Download new songs" },
                { header: "News", title: "Latest News", id: ".news", description: "Get daily updates" }
            ]
        }
    ];

    const listMessage = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: "🛡️ *ASURA MD LIST MENU* \n\nHello, Choose your command below." },
                    footer: { text: "© Arun Cumar | Asura MD" },
                    header: {
                        title: "ASURA MD BOT",
                        hasMediaAttachment: false
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Click Here for Commands",
                                    sections: sections
                                })
                            }
                        ],
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(remoteJid, listMessage, {});
    } catch (err) {
        console.error("List Menu Error:", err);
        await sock.sendMessage(remoteJid, { text: "error." });
    }
};

export default listCommand;

