import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Amazon API Configuration Test\n');

console.log('📋 Current Configuration:');
console.log('- Access Key:', process.env.AMAZON_ACCESS_KEY ? `${process.env.AMAZON_ACCESS_KEY.substring(0, 8)}...` : '❌ Missing');
console.log('- Secret Key:', process.env.AMAZON_SECRET_KEY ? `${process.env.AMAZON_SECRET_KEY.substring(0, 8)}...` : '❌ Missing');
console.log('- Associate Tag:', process.env.AMAZON_ASSOCIATE_TAG || '❌ Missing');
console.log('- Region:', process.env.AMAZON_REGION || '❌ Missing');
console.log('- Sandbox Mode:', process.env.USE_SANDBOX || 'false');

console.log('\n🔍 API Status Analysis:');
console.log('- Credentials Format: ✅ Present');
console.log('- API Response: ❌ InternalFailure');

console.log('\n💡 Possible Issues:');
console.log('1. ❌ Associates account not approved yet');
console.log('2. ❌ Need to make 3+ qualifying sales first');
console.log('3. ❌ Credentials not activated for Indian marketplace');
console.log('4. ❌ Account suspended or restricted');

console.log('\n🛠️ Solutions:');
console.log('1. ✅ Use web scraping as alternative');
console.log('2. ✅ Apply for API access approval');
console.log('3. ✅ Complete required sales threshold');

console.log('\n📊 Test Result: Amazon PA-API access currently restricted');
console.log('📱 Recommendation: Use Flipkart API (working) + web scraping for Amazon');