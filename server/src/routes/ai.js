const express = require('express');
const router = express.Router();

const aiConsultController = require('../controllers/aiConsultController');

// POST запрос для консультации - доступна всем (без регистрации)
router.post('/consult', aiConsultController.consult);

module.exports = router;
