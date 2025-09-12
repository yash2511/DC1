import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';

async function testCommands() {
  const message = `🤖 EC2 Telegram Control Ready!\n\n` +
    `📋 Available Commands:\n` +
    `/start - Start EC2 instance\n` +
    `/stop - Stop EC2 instance\n` +
    `/status - Check EC2 status\n\n` +
    `💡 Commands work even when instance is stopped!\n` +
    `⚡ Lambda function handles all requests`;

  await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  });

  console.log('✅ EC2 control commands ready!');
}

testCommands();