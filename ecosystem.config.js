module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: './flipkart/telegram-bot.js',
      cwd: '/home/ec2-user/flipkart-price-tracker',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/telegram-bot-error.log',
      out_file: './logs/telegram-bot-out.log',
      log_file: './logs/telegram-bot-combined.log',
      time: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'price-tracker',
      script: './flipkart/supabase-monitor.js',
      cwd: '/home/ec2-user/flipkart-price-tracker',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/price-tracker-error.log',
      out_file: './logs/price-tracker-out.log',
      log_file: './logs/price-tracker-combined.log',
      time: true,
      restart_delay: 10000,
      max_restarts: 10,
      min_uptime: '30s'
    },
    {
      name: 'web-server',
      script: './server.js',
      cwd: '/home/ec2-user/flipkart-price-tracker',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 10000
      },
      error_file: './logs/web-server-error.log',
      out_file: './logs/web-server-out.log',
      log_file: './logs/web-server-combined.log',
      time: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '5s'
    }
  ]
};
