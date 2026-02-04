export default async (sock, msg, args) => {
    try {
        const sender = msg.key.participant || msg.key.remoteJid;
        const thumbPath = './media/thumb.jpg'; 

        const donateText = `*〔 ASURA-MD INFRASTRUCTURE 〕*

*SYSTEM STATUS:* 🟢 Operational
*REQUEST TYPE:* Donation / Maintenance Support

Hello @${sender.split('@')[0]},
To maintain our high-speed servers and keep development free, consider a contribution.

*─── PAYMENT GATEWAY ───*

┌── 👤 *RECIPIENT*
│ Name: arunCumar
└── UPI: 08arun7@upi

┌── 💰 *BILLING*
│ Amount: ₹ 10.00
└── Currency: INR

*─── QUICK ACTIONS ───*

🔗 *DIRECT PAY:*
https://pay.upilink.in/pay/08arun7@upi?am=10

*© ASURA MD*`;
        
        await sock.sendMessage(msg.key.remoteJid, {
            image: { url: thumbPath },
            caption: donateText,
            mentions: [sender]
        }, { quoted: msg });

    } catch (e) {
        console.log("Error in donate command:", e);
    }
};
