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

  console.log("Received request body:", req.body);

  const symbol = req.body.symbol.split(".")[0];
  const price = Number(req.body.price);
  const marginPrice = Number(req.body.marginPrice);

  const closePriceLongTmp = price + marginPrice;
  const closePriceShortTmp = price - marginPrice;
  const openPriceLongTmp = price - marginPrice;
  const openPriceShortTmp = price + marginPrice;

  const closePriceLong = closePriceLongTmp.toFixed(req.body.decimalCount);
  const closePriceShort = closePriceShortTmp.toFixed(req.body.decimalCount);
  const openPriceLong = openPriceLongTmp.toFixed(req.body.decimalCount);
  const openPriceShort = openPriceShortTmp.toFixed(req.body.decimalCount);
  const size = req.body.contracts;

  let body = {
    symbol: symbol,
    productType: "USDT-FUTURES",
    marginMode: "isolated",
    marginCoin: "USDT",
    size: size,
    price: 0,
    side: req.body.action,
    tradeSide: "open",
    orderType: process.env.ORDER_TYPE,
    force: process.env.FORCE,
  };

  // check if there is an open position
  const position = req.body.positionSize;

  // close position (flat)
  if (position == 0) {
    body.price =
      req.body.prevMarketPosition === "long" ? closePriceLong : closePriceShort;
    body.side = req.body.prevMarketPosition === "long" ? "buy" : "sell";
    body.tradeSide = "close";

    const options = option(
      "POST",
      "/api/v2/mix/order/place-order",
      undefined,
      body
    );

    try {
      const orderClosed = await axios.post(
        `${process.env.API_DOMAIN}/api/v2/mix/order/place-order`,
        body,
        options
      );

      console.log(`${req.body.name} closed : `, orderClosed.data);
      res.status(200).json(orderClosed.data);
    } catch (error) {
      console.error("Error placing order:", error.response.data);
      res.status(500).json({ message: "Error placing order" });
    }
  }
  // open position
  // else {
  //   body.price =
  //     req.body.marketPosition === "long" ? openPriceLong : openPriceShort;
  //   body.side = req.body.action;
  //   body.tradeSide = "open";

  //   const options = option(
  //     "POST",
  //     "/api/v2/mix/order/place-order",
  //     undefined,
  //     body
  //   );

  //   try {
  //     const orderOpened = await axios.post(
  //       `${process.env.API_DOMAIN}/api/v2/mix/order/place-order`,
  //       body,
  //       options
  //     );

  //     console.log(`${req.body.name} opened : `, orderOpened.data);
  //     res.status(200).json(orderOpened.data);
  //   } catch (error) {
  //     console.error("Error placing order:", error.response.data);
  //     // console.log("Error placing order:", response)
  //     res.status(500).json({ message: "Error placing order" });
  //   }
  // }
});

module.exports = router;
