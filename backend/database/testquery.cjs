const client = require('../database/db');

async function getallproducts() {
  const query = 'SELECT * FROM products';
  const res = await client.query(query);
  return res.rows;
}

// ------------------ Test ------------------
(async () => {
  try {
    const user_id = 8; // replace with your test user_id
    const orders = await getallproducts();
    console.log('✅ Orders:', orders);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
})();
