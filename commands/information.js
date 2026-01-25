import { jidDecode, downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const target = args[0] || (msg.message?.extendedTextMessage?.contextInfo?.participant) || (msg.message?.extendedTextMessage?.contextInfo?.remoteJid);

    if (!target) {
        return sock.sendMessage(chat, { 
            text: "⚠️ *Usage:* .information [Number/Link/Reply]" 
        }, { quoted: msg });
    }

    try {
        await sock.sendMessage(chat, { text: "🧬 *Asura MD Deep-Scanning Database...*" });

        // --- GROUP INFORMATION EXTRACTION ---
        if (target.includes('chat.whatsapp.com') || target.endsWith('@g.us')) {
            let meta;
            if (target.includes('chat.whatsapp.com')) {
                const code = target.split('https://chat.whatsapp.com/')[1];
                meta = await sock.groupGetInviteInfo(code);
            } else {
                meta = await sock.groupMetadata(target);
            }

            const groupInfo = `
*👺 ASURA MASTER GROUP OSINT 👺*
*━━━━━━━━━━━━━━━━━━━━━━*
*──『 𝐆𝐑𝐎𝐔𝐏 𝐁𝐀𝐒𝐈𝐂𝐒 』──*
*📛 Name:* ${meta.subject}
*🆔 JID:* ${meta.id}
*👑 Owner:* ${meta.owner || 'Hidden'}
*📅 Created On:* ${new Date(meta.creation * 1000).toLocaleString()}
*👥 Capacity:* ${meta.size} Members
*📝 Description:* ${meta.desc || 'No Description Set'}

*──『 🛰️ 𝐀𝐃𝐕𝐀𝐍𝐂𝐄𝐃 𝐃𝐀𝐓𝐀 』──*
*🔒 Privacy:* ${meta.announce ? 'Admins Only' : 'Everyone'}
*🛡️ Restrictions:* ${meta.restrict ? 'Admins Only' : 'Everyone'}
*⏳ Ephemeral:* ${meta.ephemeralDuration || 'Disabled'}
*🤖 Bot Status:* Master Connected
*🔗 Link Privacy:* ${meta.inviteCode || 'Secure'}
*📊 Member Slots:* ${1024 - meta.size} Remaining
*━━━━━━━━━━━━━━━━━━━━━━*`;

            return sock.sendMessage(chat, { 
                text: groupInfo,
                contextInfo: { externalAdReply: { title: "GROUP MASTER SCAN", body: "Asura MD Intelligence", showAdAttribution: true, mediaType: 1, sourceUrl: target }}
            });
        }

        // --- PRIVATE USER DEEP SCAN ---
        const cleanNumber = target.replace(/[^0-9]/g, '');
        const jid = cleanNumber.includes('@') ? cleanNumber : cleanNumber + '@s.whatsapp.net';

        // Fetching Multi-Layered Data
        const [onWA] = await sock.onWhatsApp(jid);
        if (!onWA) return sock.sendMessage(chat, { text: "❌ *Target not on WhatsApp.*" });

        const status = await sock.fetchStatus(jid).catch(() => ({ status: "Private/Hidden" }));
        const pfp = await sock.profilePictureUrl(jid, 'image').catch(() => "https://i.imgur.com/89Gv8pL.png");
        const biz = await sock.getBusinessProfile(jid).catch(() => null);
        
        const userInfo = `
*👺 ASURA MASTER USER OSINT 👺*
*━━━━━━━━━━━━━━━━━━━━━━*
*──『 👤 𝐔𝐒𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 』──*
*📱 Phone:* +${cleanNumber}
*🎭 PushName:* ${onWA.pushname || 'Unknown'}
*📝 About:* ${status.status}
*📅 Bio Updated:* ${status.setAt ? new Date(status.setAt).toLocaleString() : 'Unknown'}

*──『 🏢 𝐁𝐔𝐒𝐈𝐍𝐄𝐒𝐒 𝐃𝐀𝐓𝐀 』──*
*💼 Account:* ${biz ? 'Verified Business' : 'Personal Account'}
*📍 Address:* ${biz?.address || 'Not Provided'}
*📧 Email:* ${biz?.email || 'Not Provided'}
*🌐 Website:* ${biz?.website || 'Not Provided'}
*📁 Category:* ${biz?.category || 'General User'}

*──『 🔐 𝐏𝐑𝐈𝐕𝐀𝐂𝐘 & 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 』──*
*🖼️ Profile:* ${pfp.includes('http') ? '✅ Visible' : '❌ Hidden'}
*💬 Chat JID:* ${jid}
*🟢 Platform:* WhatsApp Web/Mobile
*🛡️ Verification:* ${biz ? 'Business Verified' : 'Standard User'}
*🔗 Status Link:* wa.me/${cleanNumber}

*──『 📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐒 』──*
*✨ Quality:* High-Identity
*🕵️ Traceability:* 100%
*🚀 Server:* Global-ID-Asura
*━━━━━━━━━━━━━━━━━━━━━━*
> 💫 Powered by Asura MD Intelligence`;

        return sock.sendMessage(chat, { 
            image: { url: pfp }, 
            caption: userInfo,
            contextInfo: { 
                externalAdReply: { 
                    title: `SCANNING: ${cleanNumber}`, 
                    body: "Identity Extracted Successfully", 
                    showAdAttribution: false, 
                    thumbnailUrl: pfp 
                } 
            }
        });

    } catch (e) {
        console.error(e);
        return sock.sendMessage(chat, { text: "❌ *Critical Error:* Scanning Failed." });
    }
};
