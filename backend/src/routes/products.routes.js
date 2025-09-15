const router = require('express').Router();
const ctrl = require('../controllers/products.controller');

router.get('/', ctrl.list);
router.post('/seed', ctrl.seed); // remove in production

module.exports = router;