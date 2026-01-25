import { jidDecode, downloadContentFromMessage, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const voicePath = './media/song.opus'; 

    // ടാർഗറ്റ് കണ്ടെത്തുന്നു
    let target = args[0] || participant || (quoted ? null : chat);

    // VCard Extraction
    if (msg.message?.contactMessage || quoted?.contactMessage) {
        const vcard = msg.message?.contactMessage?.vcard || quoted?.contactMessage?.vcard;
        const vNumber = vcard.split('waid=')[1]?.split(':')[0];
        if (vNumber) target = vNumber + '@s.whatsapp.net';
    }

    if (!target) return sock.sendMessage(chat, { text: "⚠️ *Usage:* .information [Number/Link/Reply]" });

    try {
        // Step 1: Initiating Animation
        await sock.sendMessage(chat, { text: "🛸 *ASURA INTELLIGENCE: Piercing WhatsApp Encryption Layers...*" });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await sock.sendMessage(chat, { text: "⛓️‍💥 *Bypassing Database Firewalls...*" });

        // --- 1. THE IMPOSSIBLE GROUP RADAR ---
        if (target.includes('chat.whatsapp.com') || target.endsWith('@g.us')) {
            let meta;
            if (target.includes('chat.whatsapp.com')) {
                const code = target.split('https://chat.whatsapp.com/')[1];
                meta = await sock.groupGetInviteInfo(code);
            } else {
                meta = await sock.groupMetadata(target);
            }

            const groupIntelligence = `
*👺 ASURA GRANDMASTER GROUP Info 👺*
*━━━━━━━━━━━━━━━━━━━━━━*
*──『 🛰️ SERVER METADATA 』──*
*🆔 NODE-ID:* ${meta.id}
*📛 SUBJECT:* ${meta.subject}
*👑 CREATOR-NODE:* ${meta.owner || 'System/Hidden'}
*📅 TIMESTAMP:* ${new Date(meta.creation * 1000).toLocaleString()}
*👥 LIVE TRAFFIC:* ${meta.size} Active Nodes
*📊 VACANCY:* ${1024 - meta.size} Slots Available

*──『 🔒 SECURITY ARCHITECTURE 』──*
*🛡️ ENCRYPTION:* End-to-End (Signal Protocol)
*⚙️ ADMIN-LOCK:* ${meta.announce ? 'LOCKED' : 'OPEN'}
*⏳ DISAPPEARING:* ${meta.ephemeralDuration ? (meta.ephemeralDuration / 86400) + ' Days' : 'DISABLED'}
*🧿 APPROVAL-GATE:* ${meta.memberAddMode ? 'STRICT' : 'BYPASS'}
*🔗 INVITE-HASH:* ${meta.inviteCode || 'Internal-Access-Only'}

*──『 🎭 NEURAL ANALYSIS 』──*
*👮 TOTAL OVERSEERS:* ${meta.participants?.filter(p => p.admin).length || 'Scanning...'}
*👤 TOTAL GHOSTS:* ${meta.size - (meta.participants?.filter(p => p.admin).length || 0)}
*🤖 BOT-SYNCHRONY:* Verified

*──『 📊 DATABASE SCANNER 』──*
*📡 NODE-STATUS:* Stable
*🗳️ DATA-INTEGRITY:* 100%
*🚀 ACCESS-LEVEL:* Grandmaster
*━━━━━━━━━━━━━━━━━━━━━━*
> 💫 _Status: Deep-Scan Successful_`;

            await sock.sendMessage(chat, { text: groupIntelligence }, { quoted: msg });
        }

        // --- 2. THE IMPOSSIBLE USER RADAR ---
        else {
            const cleanNumber = target.replace(/[^0-9]/g, '');
            const jid = target.includes('@') ? target : cleanNumber + '@s.whatsapp.net';

            const [onWA] = await sock.onWhatsApp(jid);
            if (!onWA) return sock.sendMessage(chat, { text: "❌ *Signal Lost:* Target not on Mainframe." });

            const status = await sock.fetchStatus(jid).catch(() => ({ status: "ENCRYPTED/PRIVATE" }));
            const pfp = await sock.profilePictureUrl(jid, 'image').catch(() => "https://i.imgur.com/89Gv8pL.png");
            const biz = await sock.getBusinessProfile(jid).catch(() => null);

            const userIntelligence = `
*👺 ASURA GRANDMASTER USER Info 👺*
*━━━━━━━━━━━━━━━━━━━━━━*
*──『 👤 IDENTITY DECODED 』──*
*📱 VIRTUAL-ID:* +${cleanNumber}
*🎭 SERVER-NAME:* ${onWA.pushname || 'ANONYMOUS'}
*📝 BIO-BLOCK:* ${status.status}
*📅 LAST-BIO-SYNC:* ${status.setAt ? new Date(status.setAt).toLocaleString() : 'HIDDEN'}

*──『 🏢 CORPORATE FOOTPRINT 』──*
*💼 ACCOUNT-TYPE:* ${biz ? 'VERIFIED BUSINESS' : 'PERSONAL/GHOST'}
*🏷️ CATEGORY:* ${biz?.category || 'STANDARD USER'}
*📧 EMAIL-GATE:* ${biz?.email || 'NOT-CONNECTED'}
*🌐 WEB-LINK:* ${biz?.website || 'NONE'}
*📍 GEO-TAG:* ${biz?.address || 'COORDINATES-PRIVATE'}

*──『 🔐 PRIVACY MATRIX 』──*
*🖼️ AVATAR-NODE:* ${pfp.includes('http') ? '🔓 PUBLIC' : '🔒 RESTRICTED'}
*💬 JID-SIGNATURE:* ${jid}
*🛡️ VERIFICATION:* ${biz ? 'META-VERIFIED' : 'UNVERIFIED'}

*──『 📊 DATABASE SCANNER 』──*
*🚀 SCAN-STATUS:* COMPLETED
*✨ IDENTITY-STRENGTH:* ${onWA.pushname ? 'HIGH' : 'LOW'}
*🕵️ TRACE-STAMINA:* 100%
*━━━━━━━━━━━━━━━━━━━━━━*
> 💫 _100+ Metadata Points Scanned_`;

            await sock.sendMessage(chat, { 
                image: { url: pfp }, 
                caption: userIntelligence
            }, { quoted: msg });
        }

        // --- 3. VOICE RESPONSE (ADVANCED FEATURE) ---
        if (fs.existsSync(voicePath)) {
            await sock.sendMessage(chat, { 
                audio: { url: voicePath }, 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (e) {
        console.error(e);
        return sock.sendMessage(chat, { text: "❌ *Critical System Failure:* Targeted data is protected." });
    }
};
