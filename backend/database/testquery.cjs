//const client = require('../backend/config/db'); 


const client = require('./db');
const { resourceUsage } = require('process');
const { getAllProductImages} = require('./query');
(async () => {
  try {
    const result = await getAllProductImages(2);
    console.log(result);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
})();