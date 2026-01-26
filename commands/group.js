import fs from 'fs';

const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const songPath = './media/song.opus';
    const thumbPath = './media/thumb.jpg';

    // 1. ഹെൽപ്പ് മെനു - കമാൻഡുകൾ ഒന്നുമില്ലെങ്കിൽ
    if (!args[0] || args[0].toLowerCase() === 'help') {
        const helpText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*✧* 「 *\`👺Asura MD\`* 」
*╰──────────────❂*
╔━━━━━━━━━━━━❥❥❥
┃ 🛡️ *👺ULTIMATE GROUP MASTER*
┃
┃🔹🆔️ .group id
┃🔹➕ .group add [number]
┃🔹🦶 .group kick [tag/reply]
┃🔹🤴 .group promot/demote [tag]
┃🔹🔖 .group tagall [message]
┃🔹🔐 .group lock/unlock
┃🔹❌ .group delete [reply]
┃🔹⏰ .group schedule [min] [text]
┃🔹🏷 .group name/bio [text]
┃🔹🥰 .group join [link]
┃
┃✨ *SECURITY CONTROLS:*
┃🔹🙏 .group welcome on/off
┃🔹🔗 .group antilink on/off
┃🔹🚫 .group antidelete on/off
┃🔹🦠 .group antispam on/off
┃🔹🌏 .group antiforeign on/off
┃🔹📞 .group anticall on/off
┃🔹🤖 .group chatbot on/off
┃💡 .Help
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥`;

        const menuOptions = fs.existsSync(thumbPath) 
            ? { image: fs.readFileSync(thumbPath), caption: helpText } 
            : { text: helpText };

        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { audio: { url: songPath }, mimetype: "audio/ogg; codecs=opus", ptt: true });
        }
        return sock.sendMessage(chat, menuOptions, { quoted: msg });
    }

    try {
        let targetGroup = chat;
        let action = args[0].toLowerCase();
        let valueStartIdx = 1;

        // Remote control logic (JID വെച്ച് ഉപയോഗിക്കുമ്പോൾ)
        if (args[0].includes('@g.us')) {
            targetGroup = args[0];
            action = args[1]?.toLowerCase();
            valueStartIdx = 2;
        }

        const value = args.slice(valueStartIdx).join(' ');
        const db = getDB();
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        
        // ടാർഗെറ്റ് യൂസറെ കണ്ടുപിടിക്കുന്നു (Tag, Reply, Number)
        let user = quoted?.participant || quoted?.mentionedJid?.[0];
        if (!user && args[valueStartIdx]) {
            let cleanNum = args[valueStartIdx].replace(/[^0-9]/g, '');
            if (cleanNum.length > 8) user = cleanNum + '@s.whatsapp.net';
        }

        switch (action) {
            case 'id':
                return sock.sendMessage(chat, { text: `📍 *Chat ID:* ${targetGroup}` }, { quoted: msg });

            // സെക്യൂരിറ്റി കൺട്രോളുകൾ
            case 'welcome':
            case 'antilink':
            case 'antidelete':
            case 'antispam':
            case 'antiforeign':
            case 'chatbot':
                if (!db[targetGroup]) db[targetGroup] = {};
                db[targetGroup][action] = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `✅ *${action.toUpperCase()}* is now *${value.toUpperCase()}*` });

            case 'anticall':
                if (!db['global']) db['global'] = {};
                db['global'].anticall = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `🛡️ *ANTI-CALL* is now *${value.toUpperCase()}*` });

            case 'tagall':
                const metadata = await sock.groupMetadata(targetGroup);
                let tagMsg = `*📢 Group Tagall*\n\n*Message:* ${value || 'No Message'}\n\n`;
                const participants = metadata.participants.map(v => v.id);
                for (let mem of participants) {
                    tagMsg += `┣ @${mem.split('@')[0]}\n`;
                }
                return sock.sendMessage(targetGroup, { text: tagMsg, mentions: participants });

            case 'add':
                if (!user) return sock.sendMessage(chat, { text: "❌ Number ആവശ്യമാണ്!" });
                await sock.groupParticipantsUpdate(targetGroup, [user], "add");
                break;

            case 'kick':
                if (!user) return sock.sendMessage(chat, { text: "❌ ആളെ ടാഗ് ചെയ്യുകയോ റിപ്ലൈ ചെയ്യുകയോ ചെയ്യുക!" });
                await sock.groupParticipantsUpdate(targetGroup, [user], "remove");
                break;

            case 'promot':
                await sock.groupParticipantsUpdate(targetGroup, [user], "promote");
                break;

            case 'demote':
                await sock.groupParticipantsUpdate(targetGroup, [user], "demote");
                break;

            case 'lock':
                await sock.groupSettingUpdate(targetGroup, 'announcement');
                break;

            case 'unlock':
                await sock.groupSettingUpdate(targetGroup, 'not_announcement');
                break;

            case 'delete':
                if (!quoted) return sock.sendMessage(chat, { text: "❌ മെസ്സേജിന് റിപ്ലൈ നൽകുക!" });
                await sock.sendMessage(targetGroup, { delete: { remoteJid: targetGroup, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
                break;

            case 'name':
                await sock.groupUpdateSubject(targetGroup, value);
                break;

            case 'bio':
                await sock.groupUpdateDescription(targetGroup, value);
                break;

            case 'join':
                const code = value.split('chat.whatsapp.com/')[1] || value;
                await sock.groupAcceptInvite(code);
                break;

            case 'schedule':
                const schedTime = parseInt(args[valueStartIdx]);
                const schedMsg = args.slice(valueStartIdx + 1).join(' ');
                sock.sendMessage(chat, { text: `🕒 Scheduled for ${schedTime} min.` });
                setTimeout(() => { sock.sendMessage(targetGroup, { text: schedMsg }); }, schedTime * 60000);
                break;

            default:
                return sock.sendMessage(chat, { text: "❌ Invalid action. Use *.group help*" });
        }

        await sock.sendMessage(chat, { text: `✅ *Executed:* ${action.toUpperCase()}` });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ *Error:* ബോട്ടിന് അഡ്മിൻ ഉണ്ടോ എന്ന് നോക്കുക!" });
    }
};
