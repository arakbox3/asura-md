export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let user = quoted?.participant || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!user) return sock.sendMessage(chat, { text: "❌ Please provide a number or reply to a user." });
    await sock.groupParticipantsUpdate(chat, [user], "add");
    await sock.sendMessage(chat, { text: "✅ Added!" });
};
