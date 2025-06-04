# 📈 TradingBot

A Node.js-based automated trading bot that integrates with a crypto exchange API and Google Gmail API to process signals, place orders, and monitor email alerts. Built with Express.js, MySQL (via Sequelize), and Google Pub/Sub.

---

## 🚀 Features

- Crypto exchange integration via API credentials
- OAuth2 Google login & Gmail API access
- Gmail push notification support (via Pub/Sub)
- MySQL database for token storage and trade records
- Configurable order types and strategies

---

## 🛠️ Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/donny17-bit/tradingbot.git
cd tradingbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

Copy the following and fill in your actual values:

```env
API_DOMAIN=
API_KEY=
API_PASSPHRASE=
API_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

PUB_SUB_TOPIC=
BASE_URL=

EMAIL_FROM=
PORT=
FORCE=
ORDER_TYPE=
```

---

## 🔧 Scripts

- `npm start` – Start the Express server
- `npm run dev` – Start server with nodemon for development

---

## 🌐 API Endpoints

- `GET /login` – Initiates Google OAuth2 login
- `GET /oauth2callback` – Google OAuth2 callback
- `POST /gmail-notification` – Fetches recent Gmail messages (requires auth)
- `POST /place-order` – Places an order based on a Gmail-triggered signal

---

## 🧪 Technologies Used

- **Node.js**, **Express.js**
- **Google APIs (OAuth2, Gmail, Pub/Sub)**
- **Sequelize** + **MySQL**
- **dotenv**, **axios**, **googleapis**, **nodemailer**

---

## 📂 Folder Structure

```
tradingbot/
├── api/                   # API route handlers
│   └── index.js
├── config/                # DB and other config
│   ├── db.js
│   └── googleClient.js
├── models/                # Sequelize models
│   └── user.js
├── routes/                # Route handlers
│   ├── gmailNotif.js
│   ├── login.js
│   ├── oauth2callback.js
│   ├── order.js
│   └── position.js
├── server.js              # Main Express app
└── .env                   # Environment variables (not committed)
```

---

## 🔒 Environment Variables

| Variable             | Description                                 |
|----------------------|---------------------------------------------|
| `API_DOMAIN`         | API endpoint of the crypto exchange         |
| `API_KEY`            | API key for trading                         |
| `API_PASSPHRASE`     | API passphrase                              |
| `API_SECRET`         | API secret key                              |
| `GOOGLE_CLIENT_ID`   | Google OAuth2 client ID                     |
| `GOOGLE_CLIENT_SECRET`| Google OAuth2 client secret                |
| `GOOGLE_REDIRECT_URI`| Redirect URI registered with Google         |
| `DB_NAME`            | Name of the MySQL database                  |
| `DB_USER`            | MySQL username                              |
| `DB_PASSWORD`        | MySQL password                              |
| `DB_HOST`            | MySQL host (e.g., localhost or IP)          |
| `DB_PORT`            | MySQL port (default: 3306)                  |
| `PUB_SUB_TOPIC`      | Google Pub/Sub topic name for Gmail events  |
| `BASE_URL`           | Public URL where the server is hosted       |
| `EMAIL_FROM`         | Default sender email (used by nodemailer)   |
| `PORT`               | Express app port (default: 3000)            |
| `FORCE`              | Force order type of bitget open position    |
| `ORDER_TYPE`         | Default order type: `market`, `limit`, etc. |

---

## 📬 Gmail Push Notifications (Pub/Sub)

1. Set up a Pub/Sub topic and subscription on Google Cloud.
2. Ensure `BASE_URL` points to your public server for webhook delivery.
3. Gmail messages matching criteria (filters, labels) will trigger `/webhook`.

---

## 🧑‍💻 Author

**Donny Wahyu** 
> *Web Developer | Trader*

GitHub: [@donny17-bit](https://github.com/donny17-bit)  
Instagram: [@_donny_w](https://instagram.com/_donny_w)

---

## 📄 License

MIT License – feel free to fork, modify, and contribute!
