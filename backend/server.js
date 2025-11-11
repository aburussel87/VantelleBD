require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(bodyParser.json());



// Routes
const homeRoutes = require('./routes/home');
const productDetailsRoutes = require('./routes/product_details');
const imageRoutes = require('./routes/image');

// Use Routes
app.use('/api/home', homeRoutes);
app.use('/api/details', productDetailsRoutes);
app.use('/api/images', imageRoutes);







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