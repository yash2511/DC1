const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const https = require('https');
const http = require('http');

const ec2 = new EC2Client({ region: 'us-east-1' });
const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';
const INSTANCE_ID = 'i-07c88e4de52f45762';

exports.handler = async (event) => {
    try {
        // Check EC2 instance status
        const command = new DescribeInstancesCommand({ InstanceIds: [INSTANCE_ID] });
        const data = await ec2.send(command);
        
        const instance = data.Reservations[0].Instances[0];
        const state = instance.State.Name;
        const publicIp = instance.PublicIpAddress;
        
        // Check if app is responding
        let appStatus = 'Unknown';
        try {
            const response = await checkApp(publicIp);
            appStatus = response ? '✅ Running' : '❌ Not Responding';
        } catch (err) {
            appStatus = '❌ Not Responding';
        }
        
        const message = `🔍 Flipkart Tracker Status\n\n` +
                       `🖥️ EC2: ${state}\n` +
                       `🌐 IP: ${publicIp}\n` +
                       `📱 App: ${appStatus}\n` +
                       `⏰ ${new Date().toLocaleString()}`;
        
        await sendTelegram(message);
        
        return { statusCode: 200, body: 'Status sent to Telegram' };
    } catch (error) {
        await sendTelegram(`❌ Error: ${error.message}`);
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