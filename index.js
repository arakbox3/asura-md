const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");

// കമാൻഡുകൾ ലോഡ് ചെയ്യാൻ ഒരു ഫങ്ക്ഷൻ
const commands = new Map();
const loadCommands = () => {
    const commandFiles = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./plugins/${file}`);
        // ചില ഫയലുകൾ export default ഉം ചിലത് module.exports ഉം ആണ് ഉപയോഗിക്കുന്നത്
        const cmdName = command.name || file.split('.')[0];
        commands.set(cmdName.toLowerCase(), command);
    }
    console.log("✅ Commands Loaded Successfully");
};

async function startAsura() {
    const { state, saveCreds } = await useMultiFileAuthState("session_data");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
    });

    loadCommands();

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed, reconnecting...", shouldReconnect);
            if (shouldReconnect) startAsura();
        } else if (connection === "open") {
            console.log("✅ Asura MD Connected!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const messageContent = msg.message.conversation || 
                               msg.message.extendedTextMessage?.text || 
                               msg.message.imageMessage?.caption || "";
        
        if (!messageContent.startsWith(".")) return;

        const args = messageContent.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const query = args.join(" ");

        const command = commands.get(commandName);

        if (command) {
            try {
                // plugin ഫയലുകളിലെ export രീതി അനുസരിച്ച് ഇത് പ്രവർത്തിക്കും
                if (typeof command === 'function') {
                    await command(sock, msg, query);
                } else if (command.execute) {
                    await command.execute(sock, msg, args);
                }
            } catch (error) {
                console.error("Command Error:", error);
                sock.sendMessage(from, { text: "Error executing command! ❌" });
            }
        }
    });
}

startAsura();
