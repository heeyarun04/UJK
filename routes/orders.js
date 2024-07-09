const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tb_pesanan');
    const orders = result.rows;
    res.render('checkout', { orders, title: 'Orders' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/create', async (req, res) => {
  try {
    const { id_user, total_biaya, alamat, metode_pembayaran } = req.body;
    await db.query(
      'INSERT INTO tb_pesanan (id_user, total_biaya, alamat, metode_pembayaran) VALUES ($1, $2, $3, $4)',
      [id_user, total_biaya, alamat, metode_pembayaran]
    );
    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
