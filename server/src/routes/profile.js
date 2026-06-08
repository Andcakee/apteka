const express = require('express');
const router = express.Router();

// GET /api/profile - возвращает профиль аутентифицированного пользователя
router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
});

module.exports = router;
