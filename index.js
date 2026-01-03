import pkg from "@whiskeysockets/baileys";
const { 
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startAsura() {
    // സെഷൻ സൂക്ഷിക്കാൻ ഒരു ഫോൾഡർ ഉണ്ടാക്കുന്നു
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false, // പെയറിംഗ് കോഡ് ഉപയോഗിക്കുന്നതിനാൽ QR വേണ്ട
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // Pairing Code Logic
    if (!sock.authState.creds.registered) {
        console.log("Welcome to Asura MD! 👹");
        const phoneNumber = await question('Enter your Phone Number (with Country Code, eg: 91xxxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n\x1b[32mYOUR PAIRING CODE: \x1b[1m${code}\x1b[0m\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) startAsura();
        } else if (connection === 'open') {
            console.log('✅ Asura MD Connected Successfully!');
            const successMsg = "✅ *Asura MD connected successfully!*";
            await sock.sendMessage(sock.user.id, { text: successMsg });
        }
    });

    // Command Handler
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // ടെക്സ്റ്റ് മെസ്സേജ് കണ്ടെത്തുന്നു
        const body = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || 
                     msg.message.videoMessage?.caption || "";
        
        const prefix = ".";
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const query = args.join(" ");

        try {
            const cmdFile = path.resolve(`./commands/${commandName}.js`);
            
            if (fs.existsSync(cmdFile)) {
                const command = await import(`file://${cmdFile}`);
                // ഫയലിൽ 'export default' ആണെങ്കിൽ അത് ഉപയോഗിക്കും, അല്ലെങ്കില്‍ 'execute'
                const runCommand = command.default || command.execute;
                
                if (typeof runCommand === 'function') {
                    await runCommand(sock, msg, query);
                } else if (command.execute) {
                    await command.execute(sock, msg, args);
                }
            }
        } catch (err) {
            console.error("Command error:", err);
        }
    });
}

startAsura();
