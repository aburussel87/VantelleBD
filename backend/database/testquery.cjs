const client = require('./db'); // your pg Pool client

async function getAllProducts(id) {
  const query = `
    SELECT * from vantelle.get_user_with_addresses($1);
  `;

  try {
    const result = await client.query(query,[id]);
    return result.rows[0].get_user_with_addresses.addresses[0] || []; 
  } catch (err) {
    console.error('❌ Error fetching all products:', err.message);
    throw err;
  }
}

// Test the function
(async () => {
  try {
    const products = await getAllProducts(8);
    console.log(products);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
})();
