const express = require("express");
const router = express.Router();
const AffiliateProduct = require("../models/AffiliateProduct");
const { protect, adminOnly } = require("../middleware/auth"); // ⚠️ match your real path/names

router.get("/", async (req, res) => {
  try {
    const products = await AffiliateProduct.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const product = await AffiliateProduct.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product" });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await AffiliateProduct.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;