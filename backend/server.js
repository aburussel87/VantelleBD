require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const jwt = require('jsonwebtoken');
const app = express();
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://vantelle-bd.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // include PATCH
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));


app.use(bodyParser.json());
app.use(express.json()); // ✅ important
app.use(express.urlencoded({ extended: true }));



// Routes
const homeRoutes = require('./routes/home');
const productDetailsRoutes = require('./routes/product_details');
const imageRoutes = require('./routes/image');
const shopRoutes = require('./routes/shop');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const updateRoutes = require('./routes/update');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const ordersRoutes = require('./routes/orders');
const bdLocationsRoutes = require('./routes/bdLocations');

// Use Routes
app.use('/api/home', homeRoutes);
app.use('/api/details', productDetailsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/update', updateRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/bd-locations', bdLocationsRoutes);




const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`\n Server running at:`);
  console.log(`   → Local:   http://localhost:${PORT}`);
  console.log(`   → Network: http://${ip}:${PORT}\n`);
});
