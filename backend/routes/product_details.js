
// module.exports = router;
const express = require('express');
const router = express.Router();
const { get_product_by_id, getAllProductImages } = require('../database/query');

// GET /api/details/:id
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

 
    const product = await get_product_by_id(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const images = await getAllProductImages(productId);

    
    product.images = images;

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

module.exports = router;
