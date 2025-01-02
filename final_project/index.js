// index.js
require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000

// Mounting customer routes at /customer
app.use("/customer", customer_routes);

// Mounting general routes at /
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
