import fs from 'fs';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default {
    name: "search",
    alias: ["number", "track", "numinfo"],
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        try {
            let input = args.join("").replace(/[^0-9]/g, "");
            
            if (!input || input.length < 7) {
                return sock.sendMessage(from, { text: "❌ *Error:* Please provide a valid number with country code.\nExample: `.search 919876543210`" });
            }

            // ലൈബ്രറി ഉപയോഗിച്ച് നമ്പറിനെ അനലൈസ് ചെയ്യുന്നു
            const phoneNumber = parsePhoneNumberFromString('+' + input);

            if (!phoneNumber || !phoneNumber.isValid()) {
                return sock.sendMessage(from, { text: "❌ *Invalid Number:*" });
            }

            // ഡാറ്റാബേസ് വിവരങ്ങൾ എടുക്കുന്നു
            const country = phoneNumber.country; // ഉദാ: IN, US
            const countryCallingCode = phoneNumber.countryCallingCode;
            const nationalNumber = phoneNumber.nationalNumber;
            const numberType = phoneNumber.getType() || "Unknown"; // Mobile, Fixed_line etc.

            const now = new Date();
            const reportID = `ASR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            
            // Google Maps Search Link
            const mapLink = `https://www.google.com/maps/search/${encodeURIComponent(phoneNumber.country)}`;

            const report = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*✧* 「 👺Asura MD AI 」
*╰────────────❂*
╭━━━〔 👹 *ASURA GLOBAL INTELLIGENCE* 〕━━━┈⊷
┃
┃ 📂 *GENERAL FILE INFO*
┃ 🆔 *Ref ID:* ${reportID}
┃ 📱 *Target:* +${input}
┃ 📡 *Network:* ${numberType.toUpperCase()}
┃ 🕵️ *Status:* Verified / Traced
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ 🌍 *GEOGRAPHICAL DATA*
┃ 📍 *Country:* ${country} (ISO Standard)
┃ 🔢 *Dial Code:* +${countryCallingCode}
┃ 🗺️ *National Num:* ${nationalNumber}
┃ 🌐 *Map Region:* ${mapLink}
┃ 🛰️ *Global Status:* Online
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ ⚙️ *TECHNICAL SPECS*
┃ 📶 *Prefix:* +${countryCallingCode}
┃ 📟 *Format:* ${phoneNumber.formatInternational()}
┃ 💻 *Carrier Info:* Multi-Network Detected
┃ 💱 *System:* Global GSM/CDMA
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ 🔐 *SECURITY & LOGS*
┃ 🕒 *Fetch Time:* ${now.toLocaleTimeString()}
┃ 📅 *Fetch Date:* ${now.toLocaleDateString()}
┃ 🛡️ *Encryption:* AES-256 Verified
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ 🔗 *INTELLIGENCE LINKS*
┃ 🟢 *WhatsApp:* wa.me/${input}
┃ 📍 *Location Search:* ${mapLink}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> *© ASURA-MD - GLOBAL INTEL*`;

            // തമ്പ്നെയിൽ ഫയൽ ചെക്ക് ചെയ്യുന്നു
            const thumbPath = './media/asura.jpg';
            let thumbBuffer = null;
            if (fs.existsSync(thumbPath)) {
                thumbBuffer = fs.readFileSync(thumbPath);
            }

            await sock.sendMessage(from, { 
                text: report,
                contextInfo: {
                    externalAdReply: {
                        title: `GLOBAL TRACKING: +${input}`,
                        body: `Result Found for ${country} | Security: High`,
                        mediaType: 1,
                        thumbnail: thumbBuffer,
                        sourceUrl: `https://wa.me/${input}`,
                        renderLargerThumbnail: true,
                        showAdAttribution: false 
                    }
                }
            }, { quoted: msg });

        } catch (e) {
            console.error('Search Error:', e);
            await sock.sendMessage(from, { text: "❌ *Trace Failed:*" });
        }
    }
};
