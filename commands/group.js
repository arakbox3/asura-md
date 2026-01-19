export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const command = args[0]?.toLowerCase();
    const isGroup = chat.endsWith('@g.us');
    
    // --- ഹെൽപ്പ് മെനു ---
    if (!command) {
        return sock.sendMessage(chat, { 
            text: `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹*     🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 *`👺Asura MD`* 」
*╰─────────────────❂*
╔━━━━━━━━━━━━❥❥❥
┃ 🛡️ *👺ASURA ULTIMATE GROUP ┃MANAGER*
┃
┃📜 *COMMANDS:* 
┃🔹 .group add [91xx]
┃🔹 .group kick [reply/tag]
┃🔹 .group promot [reply/tag]
┃🔹 .group demote [reply/tag]
┃🔹 .group delete [reply]
┃🔹 .group lock (Only admins)
┃🔹 .group unlock (Everyone)
┃🔹 .group link (Invite link)
┃🔹 .group revoke (Reset link)
┃🔹 .group name [text]
┃🔹 .group bio [text]
┃🔹 .group mention [text]
┃🔹 .group settings (Everyone settings)
┃
┃💡 *Note:* Only for admins 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`
        }, { quoted: msg });
    }

    try {
        // --- Join Command (DM-ലും വർക്ക് ആകും) ---
        if (command === 'join') {
            const link = args[1];
            if (!link || !link.includes('chat.whatsapp.com')) return sock.sendMessage(chat, { text: "❌ ലിങ്ക് നൽകൂ." });
            const code = link.split('chat.whatsapp.com/')[1];
            await sock.groupAcceptInvite(code);
            return sock.sendMessage(chat, { text: "✅ ഗ്രൂപ്പിൽ കയറി!" });
        }

        if (!isGroup) return sock.sendMessage(chat, { text: "❌ ഗ്രൂപ്പിൽ ഉപയോഗിക്കൂ!" });

        // Target കണ്ടെത്തുന്നു (Reply/Tag/Number)
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
        let target = quotedMsg?.participant || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        // --- നേരിട്ടുള്ള കമാൻഡ് എക്സിക്യൂഷൻ ---
        switch (command) {
            case 'id':
                await sock.sendMessage(chat, { text: `📍 *ID:* ${chat}` });
                break;

            case 'add':
                await sock.groupParticipantsUpdate(chat, [target], "add");
                await sock.sendMessage(chat, { text: "✅ ചേർക്കാൻ ശ്രമിച്ചു." });
                break;

            case 'kick':
                await sock.groupParticipantsUpdate(chat, [target], "remove");
                await sock.sendMessage(chat, { text: "✅ നീക്കം ചെയ്തു." });
                break;

            case 'promot':
                await sock.groupParticipantsUpdate(chat, [target], "promote");
                await sock.sendMessage(chat, { text: "✅ അഡ്മിൻ ആക്കി." });
                break;

            case 'demote':
                await sock.groupParticipantsUpdate(chat, [target], "demote");
                await sock.sendMessage(chat, { text: "✅ അഡ്മിൻ സ്ഥാനത്ത് നിന്ന് നീക്കി." });
                break;

            case 'delete':
                if (!quotedMsg) return sock.sendMessage(chat, { text: "🗑️ റിപ്ലൈ നൽകൂ." });
                await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: false, id: quotedMsg.stanzaId, participant: quotedMsg.participant } });
                break;

            case 'lock':
                await sock.groupSettingUpdate(chat, 'announcement');
                await sock.sendMessage(chat, { text: "🔒 അഡ്മിൻ ഒൺലി." });
                break;

            case 'unlock':
                await sock.groupSettingUpdate(chat, 'not_announcement');
                await sock.sendMessage(chat, { text: "🔓 എല്ലാവർക്കും സംസാരിക്കാം." });
                break;

            case 'link':
                const code = await sock.groupInviteCode(chat);
                await sock.sendMessage(chat, { text: `🔗 https://chat.whatsapp.com/${code}` });
                break;

            case 'revoke':
                await sock.groupRevokeInvite(chat);
                await sock.sendMessage(chat, { text: "🔄 ലിങ്ക് മാറ്റി." });
                break;

            case 'name':
                await sock.groupUpdateSubject(chat, args.slice(1).join(' '));
                break;

            case 'bio':
                await sock.groupUpdateDescription(chat, args.slice(1).join(' '));
                break;

            case 'tag':
                const groupMetadata = await sock.groupMetadata(chat);
                const members = groupMetadata.participants.map(p => p.id);
                await sock.sendMessage(chat, { text: `📢 ${args.slice(1).join(' ') || 'Attention!'}`, mentions: members });
                break;

            default:
                await sock.sendMessage(chat, { text: "❌ തെറ്റായ കമാൻഡ്!" });
        }
    } catch (e) {
    
        console.error(e);
        await sock.sendMessage(chat, { text: "❌" });
    }
};
