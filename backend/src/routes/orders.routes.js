const router = require('express').Router();
const ordersController = require('../controllers/orders.controller');

router.post('/', ordersController.createOrderRecord);
router.get('/:id', ordersController.getOrder);

module.exports = router;