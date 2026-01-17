

export default async (sock, msg, args) => {
    // 1. ഫയൽ ലോഡ് ആകുമ്പോൾ ബാക്ക്ഗ്രൗണ്ട് ലിസണർ സ്റ്റാർട്ട് ചെയ്യുന്നു
    if (!global.antilinkWatcher) {
        global.antilinkWatcher = true;

        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const m = chatUpdate.messages[0];
                if (!m.message || m.key.fromMe || !m.key.remoteJid.endsWith('@g.us')) return;

                const chat = m.key.remoteJid;
                const sender = m.key.participant || m.key.remoteJid;
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

                // --- LAYER 1: CONTENT EXTRACTION ---
                const text = m.message.conversation || 
                             m.message.extendedTextMessage?.text || 
                             m.message.imageMessage?.caption || 
                             m.message.videoMessage?.caption || "";

                // --- LAYER 2: MULTI-LEVEL LINK DETECTION ---
                const linkRegex = /((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?)|(wa\.me\/[0-9]+)|(chat\.whatsapp\.com\/[a-zA-Z0-9]+)/gi;
                const hasLink = linkRegex.test(text);
                
                // Manual Fallback: Regex മിസ്സ് ചെയ്യുന്ന കണ്ണിംഗായ ലിങ്കുകൾ (.com, .in മാത്രം ഉള്ളവ)
                const isManualLink = text.includes('.') && ['.com', '.in', '.me', '.net', '.org', '.co', '.link'].some(ext => text.toLowerCase().includes(ext));

                if (hasLink || isManualLink) {
                    const groupMetadata = await sock.groupMetadata(chat);
                    const botAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
                    const senderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

                    if (botAdmin && !senderAdmin) {
                        // --- LAYER 3: FALLBACK DELETE SYSTEM ---
                        try {
                            // Method A: Direct key delete
                            await sock.sendMessage(chat, { delete: m.key });
                        } catch (err) {
                            // Method B (Fallback): Full reference delete
                            await sock.sendMessage(chat, { 
                                delete: { 
                                    remoteJid: chat, 
                                    fromMe: false, 
                                    id: m.key.id, 
                                    participant: sender 
                                } 
                            });
                        }
                    }
                }
            } catch (e) {
                // Keep it silent
            }
        });
    }

    // പ്ലഗിൻ ലോഡ് ആയെന്ന് ഉറപ്പാക്കാൻ ഡിഎമ്മിൽ മാത്രം ഈ മെസ്സേജ് കാണിക്കും
    if (msg.key.remoteJid.endsWith('@s.whatsapp.net')) {
        await sock.sendMessage(chat, { text: "🛡️ *𓆩 👺ASURA MD 𓆪 Antilink Engine Active in Background.*" });
    }
};
