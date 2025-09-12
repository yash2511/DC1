import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';

async function testCommands() {
  const commands = [
    '🤖 EC2 Control Commands Available:',
    '',
    '/status - Check EC2 uptime and status',
    '/stop - Stop the EC2 instance',
    '/restart - Restart the EC2 instance',
    '',
    '⚠️ Use /stop to save costs when not needed',
    '✅ Instance will auto-start price tracker on boot'
  ];

  await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text: commands.join('\n')
  });

  console.log('✅ EC2 control commands info sent!');
}

testCommands();