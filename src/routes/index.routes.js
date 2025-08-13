const express = require('express');
const router = express.Router();
const {authUser} = require('../middleware/auth.middleware');
router.get('/', authUser,(req, res) => {
  res.render('index', { user: req.user });
});

module.exports = router;
