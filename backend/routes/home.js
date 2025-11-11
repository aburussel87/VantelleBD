const express = require('express');
const router = express.Router();
const { get_featured_products } = require('../database/query');

// GET /api/featured-products
router.get('/', async (req, res) => {
  try {
    const featuredProducts = await get_featured_products(); 
    res.json({
      success: true,
      data: featuredProducts // send rows array
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

module.exports = router;
