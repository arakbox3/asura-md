import fs from 'fs';
import path from 'path';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const pushName = msg.pushName || "User";
    const imagePath = './media/thumb.jpg';

    // 🕒 Runtime, Date & Time
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-IN', { hour12: true });

    // 👤 Profile Info
    const userBio = (await sock.fetchStatus(sender).catch(() => ({ status: 'No Bio Found' }))).status;
    const userNumber = sender.split('@')[0];

    // 📂 കമാൻഡുകൾ റീഡ് ചെയ്യുന്നു
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    const rows = commandFiles.map(file => ({
        title: `.${file.replace('.js', '')}`,
        rowId: `.${file.replace('.js', '')}`,
        description: `Execute ${file.replace('.js', '')} command`
    }));

    const design = `
*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
*°☆°☆°☆°☆°☆°☆°☆°☆°*
╔  〔  ASURA MD  𓆩ꨄ︎𓆪  〕  ╗
   *👋 Hello, ${pushName}!*
╚═══════════╝
╭─「 📟 *SYSTEM INFO* 」
│🔹 *Runtime* : ${hours}h ${minutes}m ${seconds}s
│🔹 *Owner* : arun.cumar
│🔹 *Time* : ${time}
│🔹 *Date* : ${date}
│
├─「 👤 *USER PROFILE* 」
│🔹 *Name* : ${pushName}
│🔹 *Bio* : ${userBio}
│🔹 *Number* : ${userNumber}
│🔹 *Location* : Kerala, India
│
├─「 🌤️ *WEATHER* 」
│🔹 *Condition* : Clear Sky
│🔹 *Temp* : 29°C
│
├─「 📊 *ACTIVITY* 」
│🔹 *Last Message Count* : ${Math.floor(Math.random() * 500)}
│🔹 *Status* : Active 🟢
╰────────────●●►`;

    // 📋 Interactive List Message (Photo സഹിതം)
    const listMessage = {
        text: design,
        footer: "┋ ᴍᴀᴅᴇ ʙʏ arun cumar ༊\n© 👺 𝐴𝑠𝑢𝑟𝑎 𝑀𝐷 ᴍɪɴɪ ʙᴏᴛ",
        title: "⚙️ *ASURA MD COMMAND CENTER*",
        buttonText: "SELECT COMMANDS ⚡",
        sections: [
            {
                title: "AVAILABLE COMMANDS",
                rows: rows
            }
        ]
    };

    try {
        // ഇമേജ് ഉണ്ടെങ്കിൽ അത് ആദ്യം അയക്കും, ശേഷം ലിസ്റ്റ് അയക്കും
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { image: fs.readFileSync(imagePath), caption: "Asura MD Status Update" });
        }
        await sock.sendMessage(chat, listMessage, { quoted: msg });
    } catch (e) {
        console.error("List Message Error:", e);
        await sock.sendMessage(chat, { text: design });
    }
};
