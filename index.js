require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT;

// Middleware to parse JSON
app.use(bodyParser.json());

const positionsRouter = require("./routes/positions");
const webhookRouter = require("./routes/webhook");
const contractRouter = require("./routes/contract");
const orderRouter = require("./routes/order");
const tickerRouter = require("./routes/ticker");

app.use(positionsRouter);
app.use(webhookRouter);
app.use(contractRouter);
app.use(orderRouter);
app.use(tickerRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
