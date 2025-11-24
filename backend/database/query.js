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
           FROM product_images pi
           WHERE pi.product_id = p.id AND pi.is_main = true
          ), '[]'
        ) AS images
      FROM products p
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
    FROM product_images
    WHERE product_id = $1
    ORDER BY is_main DESC, created_at ASC;
  `;
  const result = await client.query(query, [productId]);
  return result.rows; 
}

async function get_product_by_id(product_id) {
  const query = `
    SELECT
  p.id,
  p.title,
  p.description,
  p.price,
  p.discount,
  p.discount_type,
  p.gender,
  p.season,
  p.status,
  p.category,
  SUM(i.inventory) AS inventory,
  COALESCE(json_agg(DISTINCT i.size) FILTER (WHERE i.size IS NOT NULL), '[]') AS size_options,
  COALESCE(string_agg(DISTINCT i.color, ','), '') AS color,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', pi.id,
        'image', encode(pi.image_data, 'base64'),
        'is_main', pi.is_main,
        'created_at', pi.created_at
      )
    ) FILTER (WHERE pi.id IS NOT NULL),
    '[]'
  ) AS images,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'color', i.color,
        'size', i.size,
        'inventory', i.inventory
      )
    ) FILTER (WHERE i.size IS NOT NULL AND i.color IS NOT NULL),
    '[]'
  ) AS variants
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id
LEFT JOIN product_images pi ON pi.product_id = p.id
WHERE p.id = $1
GROUP BY 
  p.id, p.title, p.description, p.price, p.discount, p.discount_type, p.gender, p.season,p.status,p.category;
  `;
  const values = [product_id];
  const result = await client.query(query, values);
  return result.rows[0];
}



async function getAllProducts() {
  const query = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.price,
      p.discount,
      p.discount_type,
      SUM(i.inventory) AS inventory,
      p.category,
      COALESCE(json_agg(DISTINCT i.size) FILTER (WHERE i.size IS NOT NULL), '[]') AS size_options,
      COALESCE(string_agg(DISTINCT i.color, ','), '') AS color,
      p.created_at,
      p.updated_at,
      p.is_featured,
      p.gender,
      p.season,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pi.id,
            'image', encode(pi.image_data, 'base64'),
            'is_main', pi.is_main,
            'created_at', pi.created_at
          )
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) AS images,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'color', i.color,
            'size', i.size,
            'inventory', i.inventory
          )
        ) FILTER (WHERE i.size IS NOT NULL AND i.color IS NOT NULL),
        '[]'
      ) AS variants
    FROM products p
    LEFT JOIN inventory i
      ON i.product_id = p.id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id
    GROUP BY 
      p.id, p.title, p.description, p.price, p.discount, p.discount_type, p.category, 
      p.created_at, p.updated_at, p.is_featured, p.gender, p.season
    ORDER BY p.created_at DESC, p.id ASC;
  `;

  const result = await client.query(query);
  return result.rows;
}




async function get_user_with_addresses(id) {
  const query = `
    SELECT * from get_user_with_addresses($1);
  `;

  try {
    const result = await client.query(query,[id]);
    return result.rows[0].get_user_with_addresses || []; 
  } catch (err) {
    console.error('❌ Error fetching all products:', err.message);
    throw err;
  }
}

async function get_user_cart(id) { 
  const query = `
    SELECT * from get_user_cart($1);
  `;

  try {
    const result = await client.query(query,[id]);
    return result.rows || []; 
  } catch (err) {
    console.error('❌ Error fetching user cart:', err.message);
    throw err;
  }
}

module.exports = {
    get_featured_products,
    get_product_by_id,
    getAllProductImages,
    getAllProducts,
    get_user_with_addresses,
    get_user_cart
};