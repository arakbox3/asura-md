export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. Identify Target User (Reply or Mention)
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        const user = quoted?.participant || quoted?.mentionedJid?.[0];

        if (!user) {
            return sock.sendMessage(chat, { 
                text: "⚠️ *Action Required:* Please reply to a message or tag a user to promote them." 
            }, { quoted: msg });
        }

        // 2. Execute Promotion
        await sock.groupParticipantsUpdate(chat, [user], "promote");

        // 3. Success Notification with Mention
        return sock.sendMessage(chat, { 
            text: `✅ *Success:* @${user.split('@')[0]} has been promoted to Admin.`,
            mentions: [user]
        }, { quoted: msg });

    } catch (error) {
        // 4. Detailed Error Handling
        console.error("Promote Error:", error);
        
        return sock.sendMessage(chat, { 
            text: "❌ *Failed:* Unable to promote user. Ensure the bot has *Admin Privileges* and the user is still in the group." 
        }, { quoted: msg });
    }
};
