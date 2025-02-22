require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT;

// Middleware to parse JSON
app.use(bodyParser.json());

const orderRouter = require("./routes/order");
app.use(orderRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
