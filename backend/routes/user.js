const express = require('express');
const userRoutes = express.Router();
const admin = require('../config/firebase');
const { db } = require('../config/firebase');
const verifyToken = require('../middleware/verifyToken');


// 🔐 [POST] /auth/register - Đã thay bằng firebase auth ở fe
userRoutes.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Lưu thêm vào Firestore nếu muốn
    await db.collection('users').doc(user.uid).set({
      name,
      email,
      createdAt: new Date()
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user_id: user.uid
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    return res.status(400).json({ error: 'Invalid input', details: error.message });
  }
});


// 🔒 [POST] /profile - Lưu thông tin người dùng (sau khi đã xác thực) - Đã thay bằng firebase auth ở fe
userRoutes.post('/profile', verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const email = req.user.email;
  const { name } = req.body;

  try {
    await db.collection('users').doc(uid).set({
      name,
      email,
      createdAt: new Date()
    }, { merge: true });

    res.status(200).json({ message: 'User profile saved.' });
  } catch (error) {
    console.error('❌ Lỗi lưu user:', error);
    res.status(500).json({ error: 'Failed to save user profile.' });
  }
});


module.exports = { userRoutes };
