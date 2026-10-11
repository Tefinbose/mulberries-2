const express = require("express");
const router = express.Router();
const { createOrder, guestCheckout, getMyOrders, getOrderById } = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.post("/guest-checkout", guestCheckout);

router.use(protect);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
