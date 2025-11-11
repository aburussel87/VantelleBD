const client = require('./db');

async function get_featured_products(){
    const query = `
      SELECT 
        p.id,
        p.title,
        p.price,
        COALESCE(
          (SELECT json_agg(
                    json_build_object(
                        'id', pi.id,
                        'image', encode(pi.image_data, 'base64')  -- convert bytea to base64
                    )
                  )
           FROM vantelle.product_images pi
           WHERE pi.product_id = p.id AND pi.is_main = true
          ), '[]'
        ) AS images
      FROM vantelle.products p
      WHERE p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT 10;
    `;
    const result = await client.query(query);
    return result.rows;
}

async function getAllProductImages(productId) {
  const query = `
    SELECT 
      id,
      encode(image_data, 'base64') AS image_base64,
      is_main,
      created_at
    FROM vantelle.product_images
    WHERE product_id = $1
    ORDER BY is_main DESC, created_at ASC;
  `;
  const result = await client.query(query, [productId]);
  return result.rows; 
}

async function get_product_by_id(product_id){
    const query = `
        SELECT * FROM vantelle.products
        WHERE id = $1;
    `;
    const values = [product_id];
    const result = await client.query(query, values);
    return result.rows[0];
}

module.exports = {
    get_featured_products,
    get_product_by_id,
    getAllProductImages
};