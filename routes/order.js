const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

router.post("/place-order", async (req, res) => {
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

  // get current price
  async function getCurrentPrice() {
    const options = option(
      "GET",
      "/api/v2/mix/market/ticker",
      "?productType=USDT-FUTURES&symbol=BTCUSDT",
      undefined
    );

    try {
      const res = await axios.get(
        `${process.env.API_DOMAIN}/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=BTCUSDT`,
        options
      );

      return res.data.data[0].lastPr;
    } catch (error) {
      console.error("Error fetching price:", error);
      res.status(500).json({ message: "Error fetching price" });
      return 0;
    }
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

      return res.data.data;
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ message: "Error fetching positions" });
      return 0;
    }
  }

  try {
    const price = await getCurrentPrice();
    const size = Math.abs(req.body.positionSize);

    let body = {
      symbol: "BTCUSDT",
      productType: "USDT-FUTURES",
      marginMode: "isolated",
      marginCoin: "USDT",
      size: size,
      price: Number(price) + Number(process.env.MARGIN_ADD_PRICE),
      side: req.body.action,
      tradeSide: "open",
      orderType: "limit",
      force: process.env.FORCE,
    };

    // check if there is an open position
    const position = await getSinglePosition();
    if (position.length > 0) {
      // close the position
      body.side = position[0].holdSide === "long" ? "buy" : "sell";
      body.tradeSide = "close";
      body.size = position[0].total;
      const options = option(
        "POST",
        "/api/v2/mix/order/place-order",
        undefined,
        body
      );

      const orderClosed = await axios.post(
        `${process.env.API_DOMAIN}/api/v2/mix/order/place-order`,
        body,
        options
      );

      console.log(
        `${position[0].holdSide} order closed successfully : `,
        orderClosed.data
      );
    }

    //  place the new order
    body.side = req.body.action;
    body.tradeSide = "open";
    body.size = size;
    const options = option(
      "POST",
      "/api/v2/mix/order/place-order",
      undefined,
      body
    );
    await axios
      .post(
        `${process.env.API_DOMAIN}/api/v2/mix/order/place-order`,
        body,
        options
      )
      .then((response) => {
        console.log(
          `${req.body.action} order placed successfully : `,
          response.data
        );
        res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Error placing order" });
  }
});

module.exports = router;
