const https = require('https');
const http = require('http');

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';
const SERVER_IP = '3.88.160.102';

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const message = body.message;
        
        if (!message || message.chat.id.toString() !== TELEGRAM_CHAT_ID) {
            return { statusCode: 200 };
        }
        
        const text = message.text?.toLowerCase();
        
        if (text === '/status' || text === 'status') {
            const appRunning = await checkApp(SERVER_IP);
            const status = appRunning ? '✅ RUNNING' : '❌ DOWN';
            
            const response = `🔍 Flipkart Tracker Status\n\n` +
                           `📱 App: ${status}\n` +
                           `🌐 Server: ${SERVER_IP}:3000\n` +
                           `⏰ ${new Date().toLocaleString()}`;
            
            await sendTelegram(response);
        }
        
        return { statusCode: 200 };
    } catch (error) {
        console.error(error);
        return { statusCode: 500 };
    }
};

function checkApp(ip) {
    return new Promise((resolve) => {
        const req = http.get(`http://${ip}:3000`, { timeout: 5000 }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => resolve(false));
    });
}

function sendTelegram(message) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        });
        
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        
        const req = https.request(options, () => resolve());
        req.write(data);
        req.end();
    });
}