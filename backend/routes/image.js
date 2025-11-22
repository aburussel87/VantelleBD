const express = require('express');
const router = express.Router();
const { getAllProductImages } = require('../database/query');

// GET /api/featured-products
router.get('/:id', async (req, res) => {
  try {
    const images = await getAllProductImages(String(req.params.id));
    res.json({
      success: true,
      data: images 
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