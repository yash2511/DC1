const https = require('https');

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';
const INSTANCE_ID = 'i-07c88e4de52f45762';

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const message = body.message;
        
        if (!message || message.chat.id.toString() !== TELEGRAM_CHAT_ID) {
            return { statusCode: 200 };
        }
        
        const command = message.text?.toLowerCase();
        
        if (command === '/start' || command === 'start') {
            await startInstance();
        } else if (command === '/stop' || command === 'stop') {
            await stopInstance();
        } else if (command === '/status' || command === 'status') {
            await checkStatus();
        }
        
        return { statusCode: 200 };
    } catch (error) {
        console.error(error);
        return { statusCode: 500 };
    }
};

async function startInstance() {
    try {
        const AWS = require('aws-sdk');
        const ec2 = new AWS.EC2({ region: 'us-east-1' });
        
        await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        
        await sendTelegram('🚀 Starting EC2 instance...\n\n⏳ Please wait 2-3 minutes for full startup\n📱 Price tracker will resume automatically');
        
        // Check status after 2 minutes
        setTimeout(async () => {
            const data = await ec2.describeInstances({ InstanceIds: [INSTANCE_ID] }).promise();
            const state = data.Reservations[0].Instances[0].State.Name;
            const ip = data.Reservations[0].Instances[0].PublicIpAddress;
            
            if (state === 'running') {
                await sendTelegram(`✅ EC2 Instance Started!\n\n🌐 IP: ${ip}\n📊 Status: ${state}\n🔄 Price tracker resuming...`);
            }
        }, 120000);
        
    } catch (error) {
        await sendTelegram(`❌ Error starting instance: ${error.message}`);
    }
}

async function stopInstance() {
    try {
        const AWS = require('aws-sdk');
        const ec2 = new AWS.EC2({ region: 'us-east-1' });
        
        await ec2.stopInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        
        await sendTelegram('🛑 Stopping EC2 instance...\n\n💰 Cost savings activated\n📱 Price alerts paused');
        
    } catch (error) {
        await sendTelegram(`❌ Error stopping instance: ${error.message}`);
    }
}

async function checkStatus() {
    try {
        const AWS = require('aws-sdk');
        const ec2 = new AWS.EC2({ region: 'us-east-1' });
        
        const data = await ec2.describeInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        const instance = data.Reservations[0].Instances[0];
        const state = instance.State.Name;
        const ip = instance.PublicIpAddress || 'None';
        
        const statusEmoji = state === 'running' ? '✅' : state === 'stopped' ? '🛑' : '⏳';
        
        await sendTelegram(`${statusEmoji} EC2 Status Report\n\n📊 State: ${state}\n🌐 IP: ${ip}\n⏰ ${new Date().toLocaleString()}`);
        
    } catch (error) {
        await sendTelegram(`❌ Error checking status: ${error.message}`);
    }
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