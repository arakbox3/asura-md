export default async (sock, msg) => {
    await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement');
    await sock.sendMessage(msg.key.remoteJid, { text: "🔒 Group Locked (Admins Only)." });
};
