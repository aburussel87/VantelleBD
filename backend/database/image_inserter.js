
const path = require('path');
const fs = require('fs');
const pool = require('./db'); // your PostgreSQL pool connection

async function insertProductImage(productId, imageFileName, isMain = false) {
  try {
    const imagePath = path.join(__dirname, '../images', imageFileName);
    const imageBuffer = fs.readFileSync(imagePath);

    const query = `
      INSERT INTO vantelle.product_images (product_id, image_data, is_main, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id;
    `;
    const values = [productId, imageBuffer, isMain];
    const result = await pool.query(query, values);

    console.log(`✅ Image inserted for product ${productId} (image_id: ${result.rows[0].id})`);
  } catch (error) {
    console.error(`❌ Error inserting image for product ${productId}:`, error.message);
  }
}

async function insertImagesForAllProducts() {
  try {
    // Get all existing product IDs
    const res = await pool.query(`SELECT id FROM vantelle.products`);
    const productIds = res.rows.map(row => row.id);

    console.log(`Found ${productIds.length} products. Inserting images...`);

    for (const id of productIds) {
      await insertProductImage(id, 'sample.jpg', false); // false = not main image
    }

    console.log('🎉 All product images inserted successfully!');
  } catch (error) {
    console.error('❌ Error during bulk insert:', error.message);
  } finally {
    pool.end();
  }
}

insertImagesForAllProducts();
