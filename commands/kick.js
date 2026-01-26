export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let user = quoted?.participant || quoted?.mentionedJid?.[0];
    if (!user) return sock.sendMessage(chat, { text: "❌ Tag or reply to a user to kick." });
    await sock.groupParticipantsUpdate(chat, [user], "remove");
    await sock.sendMessage(chat, { text: "✅ Removed!" });
};
