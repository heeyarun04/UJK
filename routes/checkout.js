const express = require("express");
const router = express.Router();
const db = require("../db");

// Checkout route
router.post("/create", async (req, res) => {
  const { alamat_pengiriman, metode_pembayaran } = req.body;
  const user_id = req.session.user.id;  

  if (!user_id || !alamat_pengiriman || !metode_pembayaran) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const cartQuery = await db.query(
      `SELECT * FROM tb_itemkeranjang WHERE id_cart = (SELECT id_cart FROM tb_keranjang WHERE id_user = $1 ORDER BY created_at DESC LIMIT 1)`,
      [user_id]
    );
    const cartItems = cartQuery.rows;

    if (cartItems.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    const total_biaya = cartItems.reduce(
      (total, item) => total + item.harga * item.kuantitas,
      0
    );

    const orderQuery = await db.query(
      `INSERT INTO tb_pesanan (id_user, alamat_pengiriman, metode_pembayaran, total_biaya, status_pesanan, tanggal_pesanan) VALUES ($1, $2, $3, $4, 'pending', NOW()) RETURNING id_order`,
      [user_id, alamat_pengiriman, metode_pembayaran, total_biaya]
    );
    const id_order = orderQuery.rows[0].id_order;

    const orderItems = cartItems.map((item) => [
      id_order,
      item.product_id,
      item.kuantitas,
      item.harga,
    ]);

    for (const orderItem of orderItems) {
      await db.query(
        `INSERT INTO tb_itempesanan (id_order, product_id, kuantitas, harga) VALUES ($1, $2, $3, $4)`,
        orderItem
      );
    }

    // Menghapus item keranjang terlebih dahulu
    await db.query(`DELETE FROM tb_itemkeranjang WHERE id_cart = (SELECT id_cart FROM tb_keranjang WHERE id_user = $1 ORDER BY created_at DESC LIMIT 1)`, [user_id]);

    // Menghapus keranjang
    await db.query(`DELETE FROM tb_keranjang WHERE id_user = $1`, [user_id]);

    res.redirect(`/checkout/confirmation/${id_order}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Order confirmation route
router.get("/confirmation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const orderQuery = await db.query(
      `SELECT * FROM tb_pesanan WHERE id_order = $1`,
      [id]
    );
    const orderData = orderQuery.rows;
    const orderItemsQuery = await db.query(
      `SELECT * FROM tb_itempesanan WHERE id_order = $1`,
      [id]
    );
    const orderItemsData = orderItemsQuery.rows;

    const order = orderData[0];
    order.items = orderItemsData;

    res.render('checkout', { title: "Order Confirmation", orders });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
