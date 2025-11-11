const path = require('path');
const fs = require('fs');
const pool = require('./db');

async function insertProductImage(productId, imageFileName, isMain = false) {
  try {
    // Build absolute path to image
    const imagePath = path.join(__dirname, '../images', imageFileName);

    // Read image as Buffer
    const imageBuffer = fs.readFileSync(imagePath);

    const query = `
      INSERT INTO vantelle.product_images (product_id, image_data, is_main, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id;
    `;
    const values = [productId, imageBuffer, isMain];

    const result = await pool.query(query, values);
    console.log('Inserted image ID:', result.rows[0].id);

  } catch (error) {
    console.error('Error inserting product image:', error);
  }
}

// Example usage
insertProductImage(2, 'product.jpg', false);
