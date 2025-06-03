require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/db");
const User = require("./models/user");

const app = express();
const PORT = process.env.PORT;

// sync database
sequelize
  .sync({ alter: true }) // or { force: true } to recreate table
  .then(() => console.log("DB Synced"))
  .catch((err) => console.error("DB Sync Error:", err));

// Middleware to parse JSON
app.use(bodyParser.json());

const orderRouter = require("./routes/order");
const positionRouter = require("./routes/position");
const emailRouter = require("./routes/email");
const oauthRouter = require("./routes/oauth2callback");
const loginRouter = require("./routes/login");
const gmailNotifRouter = require("./routes/gmailNotif");

app.use(orderRouter);
app.use(positionRouter);
app.use(emailRouter);
app.use(oauthRouter);
app.use(loginRouter);
app.use(gmailNotifRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the Express app as a serverless function
module.exports = app;
