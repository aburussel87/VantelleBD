const express = require('express');
const router = express.Router();
const { getAllProducts } = require('../database/query');

// GET /api/featured-products
router.get('/', async (req, res) => {
  try {
    const products = await getAllProducts(); 
    res.json({
      success: true,
      data: products
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
