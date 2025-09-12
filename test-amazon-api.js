const https = require('https');
const crypto = require('crypto');

// Amazon Product Advertising API 5.0 Configuration
const ACCESS_KEY = 'YOUR_ACCESS_KEY';
const SECRET_KEY = 'YOUR_SECRET_KEY';
const PARTNER_TAG = 'YOUR_PARTNER_TAG';
const HOST = 'webservices.amazon.com';
const REGION = 'us-east-1';

// Create AWS4 signature
function createSignature(method, uri, querystring, payload, headers) {
    const algorithm = 'AWS4-HMAC-SHA256';
    const service = 'ProductAdvertisingAPI';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    
    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
        .sort()
        .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
        .join('');
    
    const signedHeaders = Object.keys(headers)
        .sort()
        .map(key => key.toLowerCase())
        .join(';');
    
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalRequest = [
        method,
        uri,
        querystring,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');
    
    // Create string to sign
    const credentialScope = `${date}/${REGION}/${service}/aws4_request`;
    const stringToSign = [
        algorithm,
        datetime,
        credentialScope,
        crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');
    
    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${SECRET_KEY}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(REGION).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
    
    return `${algorithm} Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// Test Amazon API
async function testAmazonAPI() {
    try {
        const payload = JSON.stringify({
            "PartnerTag": PARTNER_TAG,
            "PartnerType": "Associates",
            "Marketplace": "www.amazon.com",
            "Keywords": "laptop",
            "SearchIndex": "All",
            "ItemCount": 5,
            "Resources": [
                "Images.Primary.Medium",
                "ItemInfo.Title",
                "Offers.Listings.Price"
            ]
        });
        
        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': HOST,
            'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
            'X-Amz-Date': new Date().toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z'
        };
        
        const authorization = createSignature('POST', '/paapi5/searchitems', '', payload, headers);
        headers['Authorization'] = authorization;
        
        const options = {
            hostname: HOST,
            port: 443,
            path: '/paapi5/searchitems',
            method: 'POST',
            headers: headers
        };
        
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        resolve(response);
                    } catch (e) {
                        resolve({ error: 'Invalid JSON response', data });
                    }
                });
            });
            
            req.on('error', reject);
            req.write(payload);
            req.end();
        });
        
    } catch (error) {
        return { error: error.message };
    }
}

// Simple Amazon scraping alternative (for testing)
async function testAmazonScraping() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'www.amazon.com',
            port: 443,
            path: '/s?k=laptop&ref=sr_pg_1',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const hasProducts = data.includes('data-component-type="s-search-result"');
                resolve({
                    status: res.statusCode,
                    hasProducts,
                    dataLength: data.length,
                    message: hasProducts ? 'Products found in search results' : 'No products detected'
                });
            });
        });
        
        req.on('error', (error) => {
            resolve({ error: error.message });
        });
        
        req.setTimeout(10000, () => {
            resolve({ error: 'Request timeout' });
        });
        
        req.end();
    });
}

// Test both methods
async function runTests() {
    console.log('🧪 Testing Amazon Integration...\n');
    
    console.log('1️⃣ Testing Amazon Product Advertising API...');
    const apiResult = await testAmazonAPI();
    console.log('API Result:', JSON.stringify(apiResult, null, 2));
    
    console.log('\n2️⃣ Testing Amazon Web Scraping...');
    const scrapingResult = await testAmazonScraping();
    console.log('Scraping Result:', JSON.stringify(scrapingResult, null, 2));
    
    console.log('\n📊 Summary:');
    console.log('- API Access:', apiResult.error ? '❌ Failed' : '✅ Success');
    console.log('- Web Scraping:', scrapingResult.error ? '❌ Failed' : '✅ Success');
    
    return {
        api: apiResult,
        scraping: scrapingResult
    };
}

// Export for use in other files
module.exports = { testAmazonAPI, testAmazonScraping, runTests };

// Run tests if called directly
if (require.main === module) {
    runTests().catch(console.error);
}