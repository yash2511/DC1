import axios from "axios";
import aws4 from "aws4";
import dotenv from "dotenv";

dotenv.config();

const endpoint = "webservices.amazon.in";
const region = "eu-west-1";

// Read sandbox flag from .env
const useSandbox = process.env.USE_SANDBOX === "true";

async function fetchProductDetails(asin) {
  const body = JSON.stringify({
    PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.in",
    ItemIds: [asin],
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "ItemInfo.ProductInfo"
    ]
  });

  let request = {
    host: endpoint,
    // append ?Sandbox=true if sandbox mode is enabled
    path: "/paapi5/getitems",
    service: "ProductAdvertisingAPI",
    region: region,
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
      Host: endpoint
    },
    body: body
  };

  aws4.sign(request, {
    accessKeyId: process.env.AMAZON_ACCESS_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_KEY
  });

  console.log("Signed Headers:", request.headers);

  try {
    const response = await axios.post(
      `https://${endpoint}${request.path}`,
      body,
      { headers: request.headers }
    );

    console.log("Raw API Response:", JSON.stringify(response.data, null, 2));

    if (response.data.ItemsResult) {
      const item = response.data.ItemsResult.Items[0];
      const title = item.ItemInfo?.Title?.DisplayValue || "N/A";
      const price = item.Offers?.Listings?.[0]?.Price?.DisplayAmount || "N/A";
      const url = item.DetailPageURL;

      console.log("Title:", title);
      console.log("Price:", price);
      console.log("Affiliate Link:", url);
    }
  } catch (err) {
    console.error("Error fetching product:", err.response?.data || err.message);
    
    // Common causes of InternalFailure:
    console.log("\nTroubleshooting steps:");
    console.log("1. Verify PA-API credentials are correct (not regular AWS credentials)");
    console.log("2. Ensure Associates account is approved and has made 3+ sales");
    console.log("3. Check if credentials are registered for this marketplace");
    console.log("4. Try enabling sandbox mode by setting USE_SANDBOX=true in .env");
  }
}

// Test with a valid Indian marketplace ASIN
fetchProductDetails("B08N5WRWNW");
