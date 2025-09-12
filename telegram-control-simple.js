import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';

// Poll for Telegram messages
async function pollTelegram() {
  let offset = 0;
  
  while (true) {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`);
      
      for (const update of response.data.result) {
        if (update.message && update.message.chat.id.toString() === TELEGRAM_CHAT_ID) {
          const command = update.message.text.toLowerCase();
          
          if (command === '/stop' || command === 'stop') {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              chat_id: TELEGRAM_CHAT_ID,
              text: '🛑 Stopping EC2 instance in 10 seconds...'
            });
            
            setTimeout(() => {
              process.exit(0); // This will stop PM2 process and trigger shutdown
            }, 10000);
          }
          
          if (command === '/status' || command === 'status') {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              chat_id: TELEGRAM_CHAT_ID,
              text: `✅ EC2 Status: Running\n⏰ Uptime: ${process.uptime()} seconds\n📊 Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
            });
          }
        }
        
        offset = update.update_id + 1;
      }
    } catch (error) {
      console.error('Polling error:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

console.log('🤖 Telegram control bot started (polling mode)');
pollTelegram();