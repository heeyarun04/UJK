const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // pastikan bcrypt sudah diinstal

// Render halaman login
router.get('/', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Proses login
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT * FROM tb_user WHERE email = $1', [email]);

  try {
    const result = await db.query('SELECT * FROM tb_user WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Set session user ID
        req.session.user = {
          id: user.id_user,
          username: user.username,
        };
        res.redirect('/home'); // Redirect to home page after successful login
      } else {
        res.send('Incorrect password');
      }
    } else {
      res.send('User not found');
    }
  } catch (error) {
    console.error('Error processing login:', error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
