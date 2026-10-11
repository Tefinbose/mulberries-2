const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @route GET /api/cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name images price discountPrice slug"
    );
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, color, size } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.color === color && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        quantity,
        color,
        size,
        priceAtAdd: product.discountPrice || product.price,
      });
    }

    await cart.save();
    await cart.populate("items.product", "name images price discountPrice slug");
    res.status(201).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/cart/:itemId
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: "Cart item not found" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "name images price discountPrice slug");
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/cart/:itemId
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate("items.product", "name images price discountPrice slug");
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };