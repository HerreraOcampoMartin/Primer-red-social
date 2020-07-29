const router = require('express').Router();

router.get('/', (req, res) => res.render('../public/index.html'));

module.exports = router;