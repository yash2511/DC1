const AWS = require('aws-sdk');
const https = require('https');

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';
const INSTANCE_ID = 'i-07c88e4de52f45762';

const ec2 = new AWS.EC2({ region: 'us-east-1' });

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));
    
    try {
        const body = JSON.parse(event.body);
        const message = body.message;
        
        if (!message || message.chat.id.toString() !== TELEGRAM_CHAT_ID) {
            return { statusCode: 200 };
        }
        
        const command = message.text?.toLowerCase();
        console.log('Command:', command);
        
        if (command === '/start' || command === 'startec2') {
            await startInstance();
        } else if (command === '/stop' || command === 'stopec2') {
            await stopInstance();
        } else if (command === '/status' || command === 'status') {
            await checkStatus();
        }
        
        return { statusCode: 200 };
    } catch (error) {
        console.error('Error:', error);
        await sendTelegram(`❌ Error: ${error.message}`);
        return { statusCode: 500 };
    }
};

async function startInstance() {
    try {
        await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        await sendTelegram('🚀 Starting EC2 instance...\n\n⏳ Please wait 2-3 minutes');
    } catch (error) {
        await sendTelegram(`❌ Start error: ${error.message}`);
    }
}

async function stopInstance() {
    try {
        await ec2.stopInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        await sendTelegram('🛑 Stopping EC2 instance...\n\n💰 Cost savings activated');
    } catch (error) {
        await sendTelegram(`❌ Stop error: ${error.message}`);
    }
}

async function checkStatus() {
    try {
        const data = await ec2.describeInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        const instance = data.Reservations[0].Instances[0];
        const state = instance.State.Name;
        const ip = instance.PublicIpAddress || 'None';
        
        await sendTelegram(`📊 EC2 Status: ${state}\n🌐 IP: ${ip}`);
    } catch (error) {
        await sendTelegram(`❌ Status error: ${error.message}`);
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