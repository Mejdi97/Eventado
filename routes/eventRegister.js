const express = require('express');
const router = express.Router();
const eventRegister=require('../controllers/eventRegisterController');

  router.post('/', eventRegister.create);

  router.get('/user_id',eventRegister.getByUser);

  module.exports = router;