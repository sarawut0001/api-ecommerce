const express = require("express");
const { authCheck } = require("../middleware/authCheck");
const { getOrderAdmin, changOrderStatus } = require("../controllers/admin");
const router = express.Router();

router.put("/admin/order-status", authCheck, changOrderStatus);
router.get("/admin/orders", authCheck, getOrderAdmin);

module.exports = router;
