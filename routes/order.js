const express = require("express");
const router = express.Router();
const db = require("../db");

// menampilkan pesanan pengguna
router.get("/", async (req, res) => {
  try {
    const ordersQuery = await db.query(
      `SELECT o.id_order, o.tanggal_pesanan, o.total_biaya, o.alamat_pengiriman, o.metode_pembayaran, u.username,
              p.nama_produk, ip.kuantitas, ip.harga
       FROM tb_pesanan o
       JOIN tb_itempesanan ip ON o.id_order = ip.id_order
       JOIN tb_produk p ON ip.product_id = p.product_id
       JOIN tb_user u ON o.id_user = u.id_user
       WHERE o.id_user = $1
       ORDER BY o.tanggal_pesanan DESC`,
       [req.session.user.id]
    );

    const rows = ordersQuery.rows;
    const orders = [];

    rows.forEach(row => {
      let order = orders.find(order => order.id_order === row.id_order);
      if (!order) {
        order = {
          id_order: row.id_order,
          tanggal_pesanan: row.tanggal_pesanan,
          total_biaya: row.total_biaya,
          alamat_pengiriman: row.alamat_pengiriman,
          metode_pembayaran: row.metode_pembayaran,
          username: row.username,
          items: []
        };
        orders.push(order);
      }
      order.items.push({
        nama_produk: row.nama_produk,
        kuantitas: row.kuantitas,
        harga: row.harga
      });
    });

    res.render('order', { title: "My Orders", orders });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
