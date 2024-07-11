const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');

// Render halaman register
router.get('/', (req, res) => {
    const success = req.query.success === 'true';
    res.render('register', { title: 'Register', success });
  });

router.post('/', async (req, res) => {
  const { username, password, email, alamat, no_telp } = req.body;
  // Hash kata sandi sebelum menyimpannya ke database
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.query(
      'INSERT INTO tb_user (username, password, email, alamat, no_telp) VALUES ($1, $2, $3, $4, $5)',
      [username, hashedPassword, email, alamat, no_telp]
    );
    res.redirect('/register?success=true');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
