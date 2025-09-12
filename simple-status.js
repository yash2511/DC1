const https = require('https');
const http = require('http');

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';
const SERVER_IP = '3.88.160.102';

exports.handler = async (event) => {
    try {
        // Check if app is responding
        const appRunning = await checkApp(SERVER_IP);
        const status = appRunning ? '✅ RUNNING' : '❌ DOWN';
        
        const message = `🔍 Flipkart Tracker Status\n\n` +
                       `📱 App Status: ${status}\n` +
                       `🌐 Server: ${SERVER_IP}:3000\n` +
                       `⏰ ${new Date().toLocaleString()}`;
        
        await sendTelegram(message);
        
        return { 
            statusCode: 200, 
            body: JSON.stringify({ status: appRunning ? 'running' : 'down' })
        };
    } catch (error) {
        await sendTelegram(`❌ Status Check Failed: ${error.message}`);
        return { statusCode: 500, body: error.message };
    }
};

function checkApp(ip) {
    return new Promise((resolve) => {
        const req = http.get(`http://${ip}:3000`, { timeout: 5000 }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => resolve(false));
        req.setTimeout(5000, () => resolve(false));
    });
}

function sendTelegram(message) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        });
        
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        const req = https.request(options, (res) => {
            resolve();
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}