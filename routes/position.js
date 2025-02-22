const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

router.get("/get-single-position", async (req, res) => {
  function option(method, path, queryString, body) {
    const hmac = crypto.createHmac("sha256", process.env.API_SECRET);
    const timestamp = Math.round(new Date());
    let pre_hash = "";

    if (method === "GET") {
      pre_hash = timestamp + method + path + queryString;
    } else {
      const stringBody = JSON.stringify(body);
      pre_hash = timestamp + method + path + stringBody;
    }

    const signature = hmac.update(pre_hash).digest("base64");

    const options = {
      headers: {
        "Content-Type": "application/json",
        "ACCESS-KEY": process.env.API_KEY,
        "ACCESS-SIGN": signature,
        "ACCESS-TIMESTAMP": timestamp,
        "ACCESS-PASSPHRASE": process.env.API_PASSPHRASE,
        locale: "en-US",
      },
    };

    return options;
  }

  //  get single position
  async function getSinglePosition() {
    const options = option(
      "GET",
      "/api/v2/mix/position/single-position",
      "?productType=USDT-FUTURES&symbol=BTCUSDT&marginCoin=USDT",
      undefined
    );

    try {
      const res = await axios.get(
        `${process.env.API_DOMAIN}/api/v2/mix/position/single-position?productType=USDT-FUTURES&symbol=BTCUSDT&marginCoin=USDT`,
        options
      );

      return res.data;
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ message: "Error fetching positions" });
      return 0;
    }
  }

  const positions = await getSinglePosition();
  res.send(positions);
});

module.exports = router;
