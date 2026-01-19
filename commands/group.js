
let groupSettings = {};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    
    if (!isGroup) return sock.sendMessage(chat, { text: "❌ ഈ കമാൻഡ് ഗ്രൂപ്പുകളിൽ മാത്രമേ പ്രവർത്തിക്കൂ!" });

    const command = args[0]?.toLowerCase();
    const groupMetadata = await sock.groupMetadata(chat);
    const participants = groupMetadata.participants;
    
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = participants.find(p => p.id === botId)?.admin;
    const isUserAdmin = participants.find(p => p.id === msg.key.participant)?.admin;

    // ഗ്രൂപ്പിനായുള്ള സെറ്റിംഗ്സ് ആദ്യമായി ലോഡ് ചെയ്യുന്നു
    if (!groupSettings[chat]) {
        groupSettings[chat] = { welcome: false, antilink: false };
    }

    if (!command) {
        return sock.sendMessage(chat, { 
            text: `🛡️ *ASURA GROUP MANAGER*\n\n` +
                 `🔹 *ADMIN COMMANDS*\n` +
                 `.group kick [reply/tag]\n` +
                 `.group add [number]\n` +
                 `.group promote/demote\n` +
                 `.group lock/unlock\n` +
                 `.group link\n\n` +
                 `🔹 *PROTECTION & BOT*\n` +
                 `.group welcome on/off (Status: ${groupSettings[chat].welcome ? '✅' : '❌'})\n` +
                 `.group antilink on/off (Status: ${groupSettings[chat].antilink ? '✅' : '❌'})\n` +
                 `.group info`
        });
    }

    if (!isUserAdmin) return sock.sendMessage(chat, { text: "❌ ഈ കമാൻഡ് ഉപയോഗിക്കാൻ നിങ്ങൾ അഡ്മിൻ ആകണം!" });
    if (!isBotAdmin) return sock.sendMessage(chat, { text: "❌ എനിക്ക് അഡ്മിൻ പവർ നൽകിയാൽ മാത്രമേ ഇത് പ്രവർത്തിക്കൂ!" });

    const target = msg.message?.extendedTextMessage?.contextInfo?.participant || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

    try {
        switch (command) {
            case 'welcome':
                if (args[1] === 'on') {
                    groupSettings[chat].welcome = true;
                    await sock.sendMessage(chat, { text: "✅ *Welcome Message ON ആക്കി.* ഗ്രൂപ്പിൽ പുതിയ ആളുകൾ വരുമ്പോൾ ബോട്ട് അറിയിക്കും." });
                } else if (args[1] === 'off') {
                    groupSettings[chat].welcome = false;
                    await sock.sendMessage(chat, { text: "❌ *Welcome Message OFF ആക്കി.*" });
                } else {
                    await sock.sendMessage(chat, { text: "ശരിയായ രീതി: `.group welcome on` അല്ലെങ്കിൽ `.group welcome off`" });
                }
                break;

            case 'antilink':
                if (args[1] === 'on') {
                    groupSettings[chat].antilink = true;
                    await sock.sendMessage(chat, { text: "✅ *Anti-link ON ആക്കി.* ഇനി ആരെങ്കിലും ലിങ്ക് അയച്ചാൽ ബോട്ട് അവരെ പുറത്താക്കും." });
                } else if (args[1] === 'off') {
                    groupSettings[chat].antilink = false;
                    await sock.sendMessage(chat, { text: "❌ *Anti-link OFF ആക്കി.*" });
                } else {
                    await sock.sendMessage(chat, { text: "ശരിയായ രീതി: `.group antilink on` അല്ലെങ്കിൽ `.group antilink off`" });
                }
                break;

            case 'kick':
                if (!target) return sock.sendMessage(chat, { text: "👤 ആരെയാണ് മാറ്റേണ്ടത്? റിപ്ലൈ ചെയ്യുക അല്ലെങ്കിൽ നമ്പർ നൽകുക." });
                await sock.groupParticipantsUpdate(chat, [target], "remove");
                await sock.sendMessage(chat, { text: "✅ പുറത്താക്കി." });
                break;

            case 'add':
                if (!target) return sock.sendMessage(chat, { text: "👤 ആരെയാണ് ചേർക്കേണ്ടത്? നമ്പർ നൽകുക." });
                await sock.groupParticipantsUpdate(chat, [target], "add");
                break;

            case 'promote':
                if (!target) return sock.sendMessage(chat, { text: "👤 ആരെയാണ് അഡ്മിൻ ആക്കേണ്ടത്?" });
                await sock.groupParticipantsUpdate(chat, [target], "promote");
                break;

            case 'demote':
                if (!target) return sock.sendMessage(chat, { text: "👤 അഡ്മിൻ പവർ ഒഴിവാക്കി." });
                await sock.groupParticipantsUpdate(chat, [target], "demote");
                break;

            case 'lock':
                await sock.groupSettingUpdate(chat, 'announcement');
                await sock.sendMessage(chat, { text: "🔒 അഡ്മിൻമാർക്ക് മാത്രമേ മെസ്സേജ് അയക്കാൻ കഴിയൂ." });
                break;

            case 'unlock':
                await sock.groupSettingUpdate(chat, 'not_announcement');
                await sock.sendMessage(chat, { text: "🔓 ഗ്രൂപ്പ് അൺലോക്ക് ചെയ്തു." });
                break;

            case 'link':
                const code = await sock.groupInviteCode(chat);
                await sock.sendMessage(chat, { text: `🔗 https://chat.whatsapp.com/${code}` });
                break;

            case 'info':
                const info = `📝 *GROUP INFO*\n🔹 *Name:* ${groupMetadata.subject}\n🔹 *Members:* ${participants.length}\n🔹 *Antilink:* ${groupSettings[chat].antilink ? 'ON' : 'OFF'}\n🔹 *Welcome:* ${groupSettings[chat].welcome ? 'ON' : 'OFF'}`;
                await sock.sendMessage(chat, { text: info });
                break;

            default:
                await sock.sendMessage(chat, { text: "❌ തെറ്റായ കമാൻഡ്! `.group` എന്ന് ടൈപ്പ് ചെയ്യുക." });
        }
    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ പിശക് സംഭവിച്ചു!" });
    }
};
