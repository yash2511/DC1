import { exec } from 'child_process';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8234908583:AAFlhHwS8MEWmv2si2VWgDy3BHIV0ri5zDQ';
const TELEGRAM_CHAT_ID = '467496219';
const INSTANCE_ID = 'i-07c88e4de52f45762';

async function sendTelegram(message) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  });
}

// Listen for Telegram commands
async function handleTelegramCommand(command) {
  try {
    switch (command.toLowerCase()) {
      case '/stop':
      case 'stop instance':
        await sendTelegram('🛑 Stopping EC2 instance...');
        exec('sudo shutdown -h now', (error) => {
          if (error) {
            console.error('Shutdown error:', error);
          }
        });
        break;
        
      case '/restart':
      case 'restart instance':
        await sendTelegram('🔄 Restarting EC2 instance...');
        exec('sudo reboot', (error) => {
          if (error) {
            console.error('Reboot error:', error);
          }
        });
        break;
        
      case '/status':
        const uptime = await new Promise((resolve) => {
          exec('uptime', (error, stdout) => {
            resolve(stdout || 'Unknown');
          });
        });
        await sendTelegram(`📊 EC2 Status:\n${uptime}`);
        break;
        
      default:
        await sendTelegram('❓ Unknown command. Use: /stop, /restart, /status');
    }
  } catch (error) {
    await sendTelegram(`❌ Error: ${error.message}`);
  }
}

// Simple HTTP server to receive Telegram webhooks
import http from 'http';

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/telegram') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        if (update.message && update.message.chat.id.toString() === TELEGRAM_CHAT_ID) {
          await handleTelegramCommand(update.message.text);
        }
      } catch (error) {
        console.error('Webhook error:', error);
      }
      res.writeHead(200);
      res.end('OK');
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3001, () => {
  console.log('Telegram EC2 control server running on port 3001');
  sendTelegram('🤖 EC2 Control Bot Started!\n\nCommands:\n/stop - Stop instance\n/restart - Restart instance\n/status - Check status');
});

export { handleTelegramCommand };