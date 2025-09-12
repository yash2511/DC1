# Flipkart Price Tracker - Folder Structure

## 📁 Organized Directory Layout

```
flipkart/
├── core/                           # Core price tracking functionality
│   ├── price-tracker-supabase.js   # Main Supabase price tracker
│   ├── price-tracker.js            # Basic price tracker
│   └── continuous-monitor.js       # Continuous monitoring logic
│
├── database/                       # Database integration modules
│   ├── supabase-database.js        # Supabase CRUD operations
│   ├── supabase-chart-integration.js # Chart data from Supabase
│   ├── database.js                 # JSON database operations
│   └── mongo-database.js           # MongoDB integration
│
├── charts/                         # Chart generation and visualization
│   ├── price-chart-generator.js    # Main chart generator
│   ├── chart-generator.js          # Basic chart functions
│   ├── enhanced-chart.js           # Enhanced chart features
│   ├── user-friendly-chart.js      # User-friendly chart design
│   ├── line-chart.js              # Line chart implementation
│   ├── png-chart.js               # PNG chart generation
│   └── *.svg                      # Generated chart files
│
├── telegram/                       # Telegram bot integration
│   ├── telegram-bot.js             # Main Telegram bot
│   ├── telegram-notify.js          # Notification functions
│   ├── get-chat-id.js             # Chat ID utilities
│   └── clear-webhook.js           # Webhook management
│
├── aws/                           # AWS deployment and infrastructure
│   ├── deploy-to-ec2.sh           # EC2 deployment script
│   ├── aws-setup.md               # AWS setup documentation
│   └── railway-deploy.md          # Railway deployment guide
│
├── config/                        # Configuration files
│   ├── products.json              # Products to monitor
│   ├── .env                       # Environment variables
│   ├── .env.example              # Environment template
│   └── .gitignore                # Git ignore rules
│
├── tests/                         # Test files and examples
│   ├── test-*.js                  # Various test scripts
│   ├── final-test.js             # Final integration test
│   └── simple-test.js            # Simple functionality test
│
├── scripts/                       # Utility and maintenance scripts
│   ├── *.sh                      # Shell scripts
│   ├── scheduler.js              # Task scheduling
│   └── clean-flipkart.js         # Cleanup utilities
│
├── docs/                          # Documentation (to be added)
│   └── (documentation files)
│
└── logs/                          # Log files and monitoring data
    ├── bot.log                    # Bot activity logs
    ├── monitor.log               # Monitoring logs
    └── *.json                    # Data files
```

## 📋 File Categories

### 🎯 Core Functionality
- **Purpose**: Main price tracking and monitoring logic
- **Key Files**: `price-tracker-supabase.js`, `continuous-monitor.js`
- **Dependencies**: Flipkart API, Supabase, Telegram

### 🗄️ Database Layer
- **Purpose**: Data storage and retrieval operations
- **Key Files**: `supabase-database.js`, `supabase-chart-integration.js`
- **Supports**: Supabase, MongoDB, JSON storage

### 📊 Chart Generation
- **Purpose**: Price visualization and chart creation
- **Key Files**: `price-chart-generator.js`, `enhanced-chart.js`
- **Output**: SVG, PNG charts with price trends

### 📱 Telegram Integration
- **Purpose**: Bot communication and notifications
- **Key Files**: `telegram-bot.js`, `telegram-notify.js`
- **Features**: Alerts, commands, webhook management

### ☁️ AWS Infrastructure
- **Purpose**: Cloud deployment and management
- **Key Files**: `deploy-to-ec2.sh`, `aws-setup.md`
- **Services**: EC2, Lambda, API Gateway

### ⚙️ Configuration
- **Purpose**: Application settings and environment
- **Key Files**: `products.json`, `.env`
- **Contains**: API keys, product lists, settings

### 🧪 Testing
- **Purpose**: Quality assurance and validation
- **Key Files**: `test-*.js`, `final-test.js`
- **Coverage**: Unit tests, integration tests

### 🔧 Scripts & Utilities
- **Purpose**: Maintenance and automation
- **Key Files**: Shell scripts, cleanup utilities
- **Functions**: Deployment, monitoring, cleanup

## 🚀 Usage by Folder

### Core Development
```bash
cd core/
node price-tracker-supabase.js
```

### Database Operations
```bash
cd database/
node supabase-database.js
```

### Chart Generation
```bash
cd charts/
node price-chart-generator.js
```

### Telegram Bot
```bash
cd telegram/
node telegram-bot.js
```

### AWS Deployment
```bash
cd aws/
./deploy-to-ec2.sh
```

### Testing
```bash
cd tests/
node test-flipkart.js
```

## 📝 Benefits of This Structure

✅ **Modular Design**: Each folder has a specific purpose
✅ **Easy Navigation**: Find files by functionality
✅ **Scalable**: Add new features in appropriate folders
✅ **Maintainable**: Clear separation of concerns
✅ **Collaborative**: Team members can work on specific modules
✅ **Deployment Ready**: Organized for CI/CD pipelines

## 🔄 Migration Notes

- All files moved to appropriate functional folders
- Import paths may need updating in some files
- Configuration files centralized in `config/`
- Tests separated for better organization
- AWS and deployment files grouped together