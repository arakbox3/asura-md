import { jidDecode, downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const voicePath = './media/song.opus';

    // Target കണ്ടെത്തുന്നു
    let target = args[0] || participant || (quoted ? null : chat);

    // VCard/Contact card സ്കാൻ
    if (msg.message?.contactMessage || quoted?.contactMessage) {
        const vcard = msg.message?.contactMessage?.vcard || quoted?.contactMessage?.vcard;
        target = vcard.split('waid=')[1]?.split(':')[0] + '@s.whatsapp.net';
    }

    try {
        // --- ANIMATED INTERFACE ---
        const { key } = await sock.sendMessage(chat, { text: "🛸 *ASURA INTEL: Accessing Global Nodes...*" });
        await new Promise(res => setTimeout(res, 800));
        await sock.sendMessage(chat, { text: "🕵️‍♂️ *Decrypting Database Entry...*", edit: key });
        await new Promise(res => setTimeout(res, 800));
        await sock.sendMessage(chat, { text: "⛓️‍💥 *Bypassing Privacy Firewalls...*", edit: key });

        // --- 1. GROUP SCAN LOGIC ---
        if (target.includes('chat.whatsapp.com') || target.endsWith('@g.us')) {
            let meta = target.includes('chat.whatsapp.com') 
                ? await sock.groupGetInviteInfo(target.split('.com/')[1]) 
                : await sock.groupMetadata(target);

            const groupInfo = `
*👺 ASURA MASTER GROUP INFO 👺*
*━━━━━━━━━━━━━━━━━━━━━━*
*──『 🛰️ SERVER METADATA 』──*
*🆔 NODE-ID:* ${meta.id}
*📛 SUBJECT:* ${meta.subject}
*👑 OWNER:* ${meta.owner || 'System-Hidden'}
*📅 CREATED:* ${new Date(meta.creation * 1000).toLocaleString()}
*👥 CAPACITY:* ${meta.size} Members

*──『 🔒 SECURITY LAYERS 』──*
*🛡️ ENCRYPTION:* Signal Protocol v3
*⚙️ SETTINGS:* ${meta.announce ? 'ADMIN-ONLY' : 'EVERYONE'}
*🧿 APPROVAL:* ${meta.memberAddMode ? 'STRICT' : 'BYPASS'}
*⏳ EPHEMERAL:* ${meta.ephemeralDuration || 'DISABLED'}
*🔗 HASH-ID:* ${meta.inviteCode || 'PROTECTED'}

*──『 📊 DB ANALYTICS 』──*
*👮 OVERSEERS:* ${meta.participants?.filter(p => p.admin).length || 'SCANNING'}
*👤 GHOSTS:* ${meta.size - (meta.participants?.filter(p => p.admin).length || 0)}
*📡 TRAFFIC:* High-Efficiency
*🤖 BOT-STATE:* Grandmaster Sync
*━━━━━━━━━━━━━━━━━━━━━━*
> 💫 _100% Group Intelligence Extracted_`;

            return sock.sendMessage(chat, { text: groupInfo }, { quoted: msg });
        }

        // --- 2. USER SCAN LOGIC ---
        const cleanNumber = target.replace(/[^0-9]/g, '');
        const jid = target.includes('@') ? target : cleanNumber + '@s.whatsapp.net';

        const [exists] = await sock.onWhatsApp(jid);
        if (!exists) return sock.sendMessage(chat, { text: "❌ *Signal Lost:* Target not found." });

        // വിവരങ്ങൾ ശേഖരിക്കുന്നു (Fail-safe methods)
        const pfp = await sock.profilePictureUrl(jid, 'image').catch(() => "https://i.imgur.com/89Gv8pL.png");
        const biz = await sock.getBusinessProfile(jid).catch(() => null);
        const status = await sock.fetchStatus(jid).catch(() => ({ status: "ENCRYPTED" }));

        const userInfo = `
*👺 ASURA MASTER USER INFO 👺*
*━━━━━━━━━━━━━━━━━━━━━━*
*──『 👤 IDENTITY CORE 』──*
*📱 VIRTUAL-ID:* +${cleanNumber}
*🎭 SERVER-NAME:* ${exists.pushname || 'ANONYMOUS'}
*📝 BIO-BLOCK:* ${status.status}
*📅 BIO-STAMP:* ${status.setAt ? new Date(status.setAt).toLocaleString() : 'HIDDEN'}

*──『 🏢 BIZ-METADATA 』──*
*💼 ACCOUNT:* ${biz ? 'VERIFIED BUSINESS' : 'PERSONAL/GHOST'}
*🏷️ CATEGORY:* ${biz?.category || 'STANDARD'}
*📧 EMAIL:* ${biz?.email || 'NOT-CONNECTED'}
*📍 GEO-TAG:* ${biz?.address || 'COORDINATES-LOCKED'}
*🌐 WEBSITE:* ${biz?.website || 'NONE'}

*──『 🔐 PRIVACY MATRIX 』──*
*🖼️ AVATAR:* ${pfp.includes('http') ? '🔓 PUBLIC' : '🔒 RESTRICTED'}
*💬 SIGNATURE:* ${jid}
*🟢 NODE-STRENGTH:* Stable
*🛡️ VERIFICATION:* ${biz ? 'META-VERIFIED' : 'UNVERIFIED'}

*──『 📊 DB SCANNER 』──*
*🚀 SCAN-STATUS:* SUCCESS
*🕵️ TRACEABILITY:* 100%
*✨ DATA-QUALITY:* Platinum
*🛰️ SERVER-NODE:* GLOBAL-ID-ASURA
*━━━━━━━━━━━━━━━━━━━━━━*
> 💫 _100+ Deep Metadata Points Analyzed_`;

        await sock.sendMessage(chat, { 
            image: { url: pfp }, 
            caption: userInfo,
            contextInfo: { externalAdReply: { title: `SCANNING: ${cleanNumber}`, body: "Identity Extraction Complete", thumbnailUrl: pfp, showAdAttribution: false }}
        }, { quoted: msg });

        // Voice അയക്കുന്നു
        if (fs.existsSync(voicePath)) {
            await sock.sendMessage(chat, { audio: { url: voicePath }, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });
        }

    } catch (e) {
        console.error(e);
        sock.sendMessage(chat, { text: "❌ *Critical Error:* Scanning protocol failed." });
    }
};
