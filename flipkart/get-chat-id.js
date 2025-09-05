import axios from "axios";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function getChatId() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`);
    const updates = response.data.result;
    
    if (updates.length > 0) {
      const chatId = updates[updates.length - 1].message.chat.id;
      console.log('Your Chat ID:', chatId);
      console.log('Add this to your .env file as TELEGRAM_CHAT_ID');
    } else {
      console.log('No messages found. Send a message to your bot first!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

getChatId();