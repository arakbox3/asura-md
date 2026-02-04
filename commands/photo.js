import axios from "axios"; 

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const prompt = args.join(" ");
    const apiKey = "AIzaSyAjdhkNjek2l9VCm6N9upQ5L1WuZvb-CC4"; 

    if (!prompt) {
        return await sock.sendMessage(from, { text: "👺 *Asura-MD:* Please provide a prompt! (eg: .photo a futuristic city)" }, { quoted: msg });
    }

    try {
        // Reaction for processing
        await sock.sendMessage(from, { react: { text: "🎨", key: msg.key } });

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3:predict?key=${apiKey}`,
            {
                instances: [{ prompt: prompt }],
                parameters: { sampleCount: 1 }
            }
        );

        // Response-ൽ നിന്ന് ഇമേജ് ഡാറ്റ എടുക്കുന്നു
        const imageData = response.data.predictions[0].bytesBase64Encoded;
        const buffer = Buffer.from(imageData, 'base64');

        await sock.sendMessage(from, {
            image: buffer,
            caption: `> 👺Asura MD`,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA-MD AI IMAGE GENERATOR",
                    body: `Prompt: ${prompt}`,
                    mediaType: 1,
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: msg });

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("Gemini Photo Error:", e.response ? e.response.data : e.message);
        await sock.sendMessage(from, { text: "❌ *Error:* സുഖം ആണോ." }, { quoted: msg });
    }
};

