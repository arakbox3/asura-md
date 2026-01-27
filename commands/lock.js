export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. Check if it's a group
        if (!chat.endsWith('@g.us')) {
            return sock.sendMessage(chat, { text: "❌ This command can only be used in groups!" });
        }

        // 2. Execution: Update group settings to 'announcement' (Admins only)
        await sock.groupSettingUpdate(chat, 'announcement');

        // 3. Success Message with professional styling
        const successText = `🔒 *Group Status: LOCKED*\n\nOnly administrators can now send messages to this group.`;
        
        await sock.sendMessage(chat, { 
            text: successText,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD SECURITY",
                    body: "Group Privacy Updated",
                    mediaType: 1,
                    sourceUrl: "",
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("Lock Command Error:", e);
        
        // Error message if the bot is not an admin
        await sock.sendMessage(chat, { 
            text: "❌ *Error:* Failed to lock the group. Please ensure the bot is a *Group Admin*." 
        }, { quoted: msg });
    }
};
