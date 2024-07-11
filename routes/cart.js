const express = require('express');
const router = express.Router();
const db = require('../db');

// Add product to cart
router.post('/add', async (req, res) => {
  try {
    const { product_id, kuantitas } = req.body;
    console.log('Received data:', { product_id, kuantitas });

    // Validasi input
    if (!product_id || !kuantitas) {
      throw new Error('Missing product_id or kuantitas');
    }

    // Ambil harga dari tabel Produk
    const productCheck = await db.query(`SELECT harga FROM tb_produk WHERE product_id = $1`, [product_id]);
    if (productCheck.rows.length === 0) {
      throw new Error('Product not found');
    }
    const harga = productCheck.rows[0].harga;

    // Dapatkan atau buat keranjang untuk pengguna
    let cart = await db.query('SELECT id_cart FROM tb_keranjang WHERE id_user = $1 ORDER BY created_at DESC LIMIT 1', [req.session.user.id]);
    if (cart.rows.length === 0) {
      cart = await db.query('INSERT INTO tb_keranjang (id_user) VALUES ($1) RETURNING id_cart', [req.session.user.id]);
    }
    const cart_id = cart.rows[0].id_cart;

    // Periksa apakah produk sudah ada di keranjang
    const existingItem = await db.query('SELECT * FROM tb_itemkeranjang WHERE id_cart = $1 AND product_id = $2', [cart_id, product_id]);
    if (existingItem.rows.length > 0) {
      // Perbarui kuantitas jika produk sudah ada di keranjang
      await db.query('UPDATE tb_itemkeranjang SET kuantitas = kuantitas + $3, harga = harga + $4 WHERE id_cart = $1 AND product_id = $2', [cart_id, product_id, kuantitas, harga]);
    } else {
      // Tambahkan item baru ke keranjang
      await db.query(
        'INSERT INTO tb_itemkeranjang (id_cart, product_id, kuantitas, harga) VALUES ($1, $2, $3, $4)',
        [cart_id, product_id, kuantitas, harga]
      );
    }

    res.redirect('/cart');
  } catch (err) {
    console.error('Error inserting into database:', err);
    res.status(500).send('Internal Server Error');
  }
});


// View cart
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ic.id_cart_item, ic.kuantitas, ic.harga, p.product_id, p.nama_produk 
      FROM tb_itemkeranjang ic
      JOIN tb_produk p ON ic.product_id = p.product_id
      WHERE ic.id_cart = (SELECT id_cart FROM tb_keranjang WHERE id_user = $1 ORDER BY created_at DESC LIMIT 1)
    `, [req.session.user.id]);

    const cartItems = result.rows;
    res.render('cart', { cartItems, title: 'Cart' });
  } catch (err) {
    console.error('Error fetching items from cart:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Remove item from cart
router.post('/remove', async (req, res) => {
  try {
    const { id_cart_item } = req.body;
    await db.query('DELETE FROM tb_itemkeranjang WHERE id_cart_item = $1', [id_cart_item]);
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Reduce item quantity in cart
router.post('/reduce', async (req, res) => {
  try {
    const { id_cart_item } = req.body;
    const itemResult = await db.query('SELECT kuantitas, harga, product_id FROM tb_itemkeranjang WHERE id_cart_item = $1', [id_cart_item]);
    const item = itemResult.rows[0];

    if (item.kuantitas > 1) {
      const newKuantitas = item.kuantitas - 1;
      const productResult = await db.query('SELECT harga FROM tb_produk WHERE product_id = $1', [item.product_id]);
      const newHarga = productResult.rows[0].harga * newKuantitas;

      await db.query('UPDATE tb_itemkeranjang SET kuantitas = $1, harga = $2 WHERE id_cart_item = $3', [newKuantitas, newHarga, id_cart_item]);
    } else {
      await db.query('DELETE FROM tb_itemkeranjang WHERE id_cart_item = $1', [id_cart_item]);
    }
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
