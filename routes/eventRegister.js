const express = require('express');
const router = express.Router();
const eventRegister=require('../controllers/eventRegisterController');

  router.post('/', eventRegister.create);


  //get user's event
  router.get('/:id',eventRegister.getByUser);

  module.exports = router;