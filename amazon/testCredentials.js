import axios from "axios";
import aws4 from "aws4";
import dotenv from "dotenv";

dotenv.config();

async function testCredentials() {
  const body = JSON.stringify({
    PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.in"
  });

  const request = {
    host: "webservices.amazon.in",
    path: "/paapi5/searchitems",
    service: "ProductAdvertisingAPI",
    region: "eu-west-1",
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Host: "webservices.amazon.in",
      Accept: "application/json"
    },
    body: body
  };

  aws4.sign(request, {
    accessKeyId: process.env.AMAZON_ACCESS_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_KEY
  });

  try {
    const response = await axios.post(
      `https://webservices.amazon.in${request.path}`,
      body,
      { headers: request.headers }
    );
    console.log("Credentials are valid!");
  } catch (err) {
    const error = err.response?.data;
    if (error?.__type === "com.amazon.coral.service#InternalFailure") {
      console.log("❌ Invalid PA-API credentials or unapproved Associates account");
    } else {
      console.log("Error:", error);
    }
  }
}

testCredentials();