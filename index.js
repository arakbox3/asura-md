import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import { pathToFileURL } from 'url';
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startAsura() {
    // 1. Setup Auth State
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    // 2. Initialize Socket
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // 3. Pairing Code Logic
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('\nEnter your Phone Number (eg: 91xxxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\x1b[32m\nYOUR PAIRING CODE: \x1b[1m${code}\x1b[0m\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    // 4. Connection Handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startAsura();
        } else if (connection === 'open') {
            console.log('\x1b[36m✅ Asura MD Connected Successfully!\x1b[0m');
            // Notify Owner
            const myNumber = "919048044745@s.whatsapp.net"; 
            await sock.sendMessage(myNumber, { text: "*Asura MD is Online!* 👺\n\nI am now listening for commands starting with '.'" });
        }
    });

    // 5. Message & Command Handler
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            // Extract message body
            const body = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption || "";
            
            const prefix = "."; 
            if (!body.startsWith(prefix)) return;

            // Parse Command and Arguments
            const args = body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            console.log(`\x1b[33m[COMMAND] -> ${commandName}\x1b[0m`);

            // Find Command File
            const commandPath = path.join(process.cwd(), 'commands', `${commandName}.js`);

            if (fs.existsSync(commandPath)) {
                // Dynamic Import
                const commandModule = await import(pathToFileURL(commandPath).href);
                const runCommand = commandModule.default;
                
                if (typeof runCommand === 'function') {
                    await runCommand(sock, msg, args);
                    console.log(`\x1b[32m[SUCCESS] -> ${commandName} executed\x1b[0m`);
                } else {
                    console.log(`\x1b[31m[ERROR] -> ${commandName}.js is missing 'export default'\x1b[0m`);
                }
            } else {
                console.log(`\x1b[31m[NOT FOUND] -> ${commandPath}\x1b[0m`);
            }
        } catch (err) {
            console.error("\x1b[31m[CRITICAL ERROR]\x1b[0m", err);
        }
    });
}

// Start the bot
startAsura();
