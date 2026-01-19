export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const command = args[0]?.toLowerCase();
    const isGroup = chat.endsWith('@g.us');
    
    // --- ഹെൽപ്പ് മെനു (നിങ്ങളുടെ ഡിസൈൻ) ---
    if (!command) {
        const helpText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 *\`👺Asura MD\`* 」
*╰─────────────────❂*
╔━━━━━━━━━━━━❥❥❥
┃ 🛡️ *👺ASURA ULTIMATE GROUP*
┃      *MANAGER*
┃
┃📜 *COMMANDS:* ┃🔹 .group add [91xx]
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
┃🔹 .group tag [text]
┃🔹 .group join [link]
┃
┃💡 *Note:* Only for admins 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;
        return sock.sendMessage(chat, { text: helpText }, { quoted: msg });
    }

    try {
        // --- Join Command (DM & Group) ---
        if (command === 'join') {
            const link = args[1];
            if (!link || !link.includes('chat.whatsapp.com')) return sock.sendMessage(chat, { text: "❌ ലിങ്ക് നൽകൂ." });
            const code = link.split('chat.whatsapp.com/')[1];
            await sock.groupAcceptInvite(code);
            return sock.sendMessage(chat, { text: "✅ ഗ്രൂപ്പിൽ കയറി!" });
        }

        if (!isGroup) return sock.sendMessage(chat, { text: "❌ ഗ്രൂപ്പിൽ ഉപയോഗിക്കൂ!" });

        // --- Target കണ്ടെത്തുന്നു (Fixed Target Logic) ---
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let target = quoted?.participant || (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        switch (command) {
            case 'id':
                await sock.sendMessage(chat, { text: `📍 *Group ID:* ${chat}` });
                break;

            case 'add':
                if (!target) return sock.sendMessage(chat, { text: "👤 നമ്പർ നൽകൂ!" });
                await sock.groupParticipantsUpdate(chat, [target], "add");
                await sock.sendMessage(chat, { text: "✅ ചേർത്തു." });
                break;

            case 'kick':
                if (!target) return sock.sendMessage(chat, { text: "👤 ടാഗ് ചെയ്യുകയോ റിപ്ലൈ നൽകുകയോ ചെയ്യുക." });
                await sock.groupParticipantsUpdate(chat, [target], "remove");
                await sock.sendMessage(chat, { text: "✅ നീക്കം ചെയ്തു." });
                break;

            case 'promot':
                if (!target) return sock.sendMessage(chat, { text: "👤 ടാർഗറ്റിനെ കണ്ടെത്താനായില്ല." });
                await sock.groupParticipantsUpdate(chat, [target], "promote");
                await sock.sendMessage(chat, { text: "✅ അഡ്മിൻ പവർ നൽകി." });
                break;

            case 'demote':
                if (!target) return sock.sendMessage(chat, { text: "👤 ടാർഗറ്റിനെ കണ്ടെത്താനായില്ല." });
                await sock.groupParticipantsUpdate(chat, [target], "demote");
                await sock.sendMessage(chat, { text: "✅ അഡ്മിൻ പവർ നീക്കം ചെയ്തു." });
                break;

            case 'delete':
                if (!quoted) return sock.sendMessage(chat, { text: "🗑️ മെസ്സേജിന് റിപ്ലൈ നൽകൂ." });
                await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
                break;

            case 'lock':
                await sock.groupSettingUpdate(chat, 'announcement');
                await sock.sendMessage(chat, { text: "🔒 ഗ്രൂപ്പ് ലോക്ക് ചെയ്തു (Admins Only)." });
                break;

            case 'unlock':
                await sock.groupSettingUpdate(chat, 'not_announcement');
                await sock.sendMessage(chat, { text: "🔓 ഗ്രൂപ്പ് അൺലോക്ക് ചെയ്തു (Everyone)." });
                break;

            case 'link':
                const inviteCode = await sock.groupInviteCode(chat);
                await sock.sendMessage(chat, { text: `🔗 https://chat.whatsapp.com/${inviteCode}` });
                break;

            case 'revoke':
                await sock.groupRevokeInvite(chat);
                await sock.sendMessage(chat, { text: "🔄 ഗ്രൂപ്പ് ലിങ്ക് റീസെറ്റ് ചെയ്തു." });
                break;

            case 'name':
                const newName = args.slice(1).join(' ');
                if (!newName) return sock.sendMessage(chat, { text: "📝 പേര് നൽകുക." });
                await sock.groupUpdateSubject(chat, newName);
                break;

            case 'bio':
                const newBio = args.slice(1).join(' ');
                if (!newBio) return sock.sendMessage(chat, { text: "📝 വിവരം നൽകുക." });
                await sock.groupUpdateDescription(chat, newBio);
                break;

            case 'tag':
            case 'mention':
                const metadata = await sock.groupMetadata(chat);
                const participants = metadata.participants.map(p => p.id);
                const tagMsg = args.slice(1).join(' ') || 'Attention everyone! 👋';
                await sock.sendMessage(chat, { text: `📢 *${tagMsg}*`, mentions: participants });
                break;

            default:
                await sock.sendMessage(chat, { text: "❌ തെറ്റായ കമാൻഡ്!" });
        }
    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ *Error:* ബോട്ട് അഡ്മിൻ ആണെന്ന് ഉറപ്പാക്കുക!" });
    }
};
