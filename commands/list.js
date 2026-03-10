import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

const listCommand = async (sock, msg, args) => {
    const { remoteJid } = msg.key;


    const buttons = [
        {
            "name": "single_select",
            "buttonParamsJson": JSON.stringify({
                title: "📂 Open Menu",
                sections: [
                    {
                        title: "🌟 MAIN COMMANDS",
                        rows: [
                            { header: "STATUS", title: "Ping / Speed", id: ".ping", description: "Check Bot Latency" },
                            { header: "ALL", title: "Full Menu", id: ".menu", description: "Show all commands" }
                        ]
                    },
                    {
                        title: "🛠️ ADVANCED TOOLS",
                        rows: [
                            { header: "MAP", title: "Send Location", id: ".loc", description: "Share current location" },
                            { header: "LINK", title: "Official Group", id: ".owner", description: "Join Support" }
                        ]
                    }
                ]
            })
        },
        {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "🌐 Visit Website",
                url: "was.me/7736811908",
                merchant_url: "https://www.google.com"
            })
        },
        {
            "name": "cta_copy",
            "buttonParamsJson": JSON.stringify({
                display_text: "📋 Copy Bot ID",
                copy_code: "ASURA-MD-2026"
            })
        }
    ];

    
    const messageContent = generateWAMessageFromContent(remoteJid, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        title: "⚡ *ASURA MD V3*",
                        hasMediaAttachment: false
                    },
                    body: {
                        text: "Welcome to Asura MD. Select an option from the menu below or use the quick buttons."
                    },
                    footer: {
                        text: "Developed by Arun Cumar"
                    },
                    nativeFlowMessage: {
                        buttons: buttons
                    }
                }
            }
        }
    }, { quoted: msg });

    try {
        await sock.relayMessage(remoteJid, messageContent.message, { messageId: messageContent.key.id });
    } catch (err) {
        console.error("Advanced Menu Error:", err);
        await sock.sendMessage(remoteJid, { text: "error!" });
    }
};

export default listCommand;
