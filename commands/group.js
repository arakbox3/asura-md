import fs from 'fs';

const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const songPath = './media/song.opus';
    const thumbPath = './media/thumb.jpg';

    // --- 1. Help Menu Design ---
    if (!args[0] || args[0].toLowerCase() === 'help') {
        const helpText = `
*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
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

        // ഇമേജ് ഉണ്ടെങ്കിൽ ഇമേജ് സഹിതം മെനു അയക്കും
        const menuOptions = { caption: helpText, mentions: [msg.key.participant || chat] };
        if (fs.existsSync(thumbPath)) {
            menuOptions.image = fs.readFileSync(thumbPath);
        } else {
            menuOptions.text = helpText;
        }

        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { audio: { url: songPath }, mimetype: "audio/ogg; codecs=opus", ptt: true });
        }
        return sock.sendMessage(chat, menuOptions, { quoted: msg });
    }

    try {
        let targetGroup = chat;
        let action;
        let valueStartIdx;

        // Remote Group Control Check
        if (args[0].includes('@g.us')) {
            targetGroup = args[0];
            action = args[1]?.toLowerCase();
            valueStartIdx = 2;
        } else {
            action = args[0]?.toLowerCase();
            valueStartIdx = 1;
        }

        const value = args.slice(valueStartIdx).join(' ');
        const db = getDB();
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let user = quoted?.participant || quoted?.mentionedJid?.[0] || (args[valueStartIdx] ? args[valueStartIdx].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        switch (action) {
            case 'id':
                return sock.sendMessage(chat, { text: `📍 *Chat ID:* ${targetGroup}` }, { quoted: msg });

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
                return sock.sendMessage(chat, { text: `🛡️ *ANTI-CALL* is now *${value.toUpperCase()}* (Global)` });

            case 'tagall':
                const metadata = await sock.groupMetadata(targetGroup);
                let message = `*📢 Group Announcement*\n\n*Message:* ${value || 'No Message'}\n\n`;
                for (let mem of metadata.participants) {
                    message += `┣ @${mem.id.split('@')[0]}\n`;
                }
                return sock.sendMessage(targetGroup, { text: message, mentions: metadata.participants.map(a => a.id) });

            case 'add':
                await sock.groupParticipantsUpdate(targetGroup, [user], "add");
                break;

            case 'kick':
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
                if (!quoted) return sock.sendMessage(chat, { text: "❌ Reply to a message to delete it." });
                await sock.sendMessage(targetGroup, { delete: { remoteJid: targetGroup, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
                break;

            case 'name':
                await sock.groupUpdateSubject(targetGroup, value);
                break;

            case 'bio':
                await sock.groupUpdateDescription(targetGroup, value);
                break;

            case 'join':
                const code = value.split('chat.whatsapp.com/')[1];
                if (!code) return sock.sendMessage(chat, { text: "❌ Invalid Link" });
                await sock.groupAcceptInvite(code);
                break;

            default:
                return sock.sendMessage(chat, { text: "❌ Invalid action. Use *.group help*" });
        }

        await sock.sendMessage(chat, { text: `✅ *Executed:* ${action.toUpperCase()}` });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ *Error:* Permisson denied or invalid input." });
    }
};
