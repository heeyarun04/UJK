const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tb_itemkeranjang');
    const cartItems = result.rows;
    res.render('cart', { cartItems, title: 'Cart' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/add', async (req, res) => {
  try {
    const { product_id, kuantitas } = req.body;
    await db.query('INSERT INTO tb_itemkeranjang (product_id, kuantitas) VALUES ($1, $2)', [product_id, kuantitas]);
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
