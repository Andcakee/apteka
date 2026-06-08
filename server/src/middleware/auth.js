const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await userService.getById(payload.id);
    if (!user) {
      req.user = null;
      return next();
    }
    // attach user info с ролью
    req.user = { id: user.id, email: user.email, name: user.name, role: user.role || 'user' };
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

// Функция authenticate: проверяет что пользователь авторизован
function authenticate(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Функция requireRole: проверяет что пользователь имеет нужную роль
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports.authenticate = authenticate;
module.exports.requireRole = requireRole;
module.exports.default = module.exports;
