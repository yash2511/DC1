const AWS = require('aws-sdk');
const https = require('https');

const ec2 = new AWS.EC2();
const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';
const INSTANCE_ID = 'i-07c88e4de52f45762';

exports.handler = async (event) => {
    try {
        // Check EC2 instance status
        const params = { InstanceIds: [INSTANCE_ID] };
        const data = await ec2.describeInstances(params).promise();
        
        const instance = data.Reservations[0].Instances[0];
        const state = instance.State.Name;
        const publicIp = instance.PublicIpAddress;
        
        // Check if app is responding
        let appStatus = 'Unknown';
        try {
            const response = await checkApp(publicIp);
            appStatus = response ? 'Running' : 'Not Responding';
        } catch (err) {
            appStatus = 'Not Responding';
        }
        
        const message = `🔍 Flipkart Tracker Status Report\n\n` +
                       `🖥️ EC2 Instance: ${state}\n` +
                       `🌐 IP: ${publicIp}\n` +
                       `📱 App Status: ${appStatus}\n` +
                       `⏰ Time: ${new Date().toLocaleString()}`;
        
        await sendTelegram(message);
        
        return { statusCode: 200, body: 'Status sent' };
    } catch (error) {
        await sendTelegram(`❌ Error checking status: ${error.message}`);
        return { statusCode: 500, body: error.message };
    }
};

function checkApp(ip) {
    return new Promise((resolve) => {
        const req = require('http').get(`http://${ip}:3000`, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
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
            headers: { 'Content-Type': 'application/json' }
        };
        
        const req = https.request(options, (res) => resolve());
        req.write(data);
        req.end();
    });
}