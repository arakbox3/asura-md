import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Readable } from "stream";

// ========= CONFIG =========
const apiId = 12938494;
const apiHash = "bdbdfa189d74ffd44b5be4bed1a26247";
const botToken = "7599052852:AAEMW-41BN1j3FwjkTN7bUkTTcliGAt5z8A";
const channelId = -1001891724070;
// ==========================

const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
});

let started = false;
let channelEntity;
const userCache = new Map();

// ---------- INIT TELEGRAM ----------
async function initTelegram() {
    if (started) return;

    await client.start({ botAuthToken: botToken });

    // Proper channel resolve (VERY IMPORTANT)
    channelEntity = await client.getEntity(channelId);

    started = true;
    console.log("✅ Telegram Connected");
}

// ---------- FILENAME HELPER ----------
function getFileName(media) {
    if (media?.document) {
        const attr = media.document.attributes.find(a =>
            a instanceof Api.DocumentAttributeFilename
        );
        return attr?.fileName || "Media_File";
    }
    return "Video_File";
}

// ---------- TELEGRAM TRUE STREAM ----------
async function telegramReadableStream(media) {
    const iterator = client.iterDownload(media, {
        offset: 0,
        requestSize: 1024 * 512, // 512KB chunks
    });

    return Readable.from(iterator);
}

// ---------- MAIN EXPORT ----------
export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const text = (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        ""
    ).trim();

    try {
        await initTelegram();

        // ================= .tv SHUFFLE =================
        if (text === ".tv") {
            await sock.sendMessage(from, { text: "🎲 Fetching random media..." }, { quoted: msg });

            const history = await client.getMessages(channelEntity, { limit: 300 });
            const mediaMsgs = history.filter(m => m.media);

            if (!mediaMsgs.length)
                return sock.sendMessage(from, { text: "❌ No media found in channel" });

            const shuffled = mediaMsgs.sort(() => 0.5 - Math.random()).slice(0, 15);
            userCache.set(sender, shuffled);

            let list = `╭─〔 👺 ASURA TV SHUFFLE 〕─\n\n`;
            shuffled.forEach((m, i) => {
                list += `*${i + 1}* ➠ ${getFileName(m.media)}\n\n`;
            });
            list += "Reply with number to stream";

            return sock.sendMessage(from, { text: list }, { quoted: msg });
        }

        // ================= .tv NAME SEARCH =================
        if (text.startsWith(".tv ")) {
            const query = text.replace(".tv ", "").toLowerCase();

            await sock.sendMessage(from, { text: `🔎 Searching: ${query}` }, { quoted: msg });

            const history = await client.getMessages(channelEntity, { limit: 500 });

            const results = history.filter(m =>
                m.media &&
                getFileName(m.media).toLowerCase().includes(query)
            );

            if (!results.length)
                return sock.sendMessage(from, { text: "❌ No matching files found" });

            const selected = results.slice(0, 15);
            userCache.set(sender, selected);

            let list = `╭─〔 👺 ASURA TV SEARCH 〕─\n\n`;
            selected.forEach((m, i) => {
                list += `*${i + 1}* ➠ ${getFileName(m.media)}\n\n`;
            });
            list += "Reply with number to stream";

            return sock.sendMessage(from, { text: list }, { quoted: msg });
        }

        // ================= REPLY NUMBER STREAM =================
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (quoted && !isNaN(text)) {
            const files = userCache.get(sender);
            const index = parseInt(text) - 1;

            if (!files || !files[index]) return;

            const media = files[index].media;
            const fileName = getFileName(media);
            const mimeType = media.document?.mimeType || "video/mp4";

            await sock.sendMessage(from, { text: "🚀 Streaming large file from Telegram..." }, { quoted: msg });

            const stream = await telegramReadableStream(media);

            await sock.sendMessage(from, {
                document: stream,  // STREAM HERE (no RAM)
                mimetype: mimeType,
                fileName: fileName,
                caption: "✅ Streamed via ASURA MD"
            }, { quoted: msg });
        }

    } catch (err) {
        console.error(err);
        await sock.sendMessage(from, { text: "Error: " + err.message });
    }
};
