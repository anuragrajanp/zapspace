import express from "express";
import Product from "../models/productModel.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix); // Set the filename for uploaded images
  },
});

const upload = multer({ storage });

router.post("/", async (req, res) => {
  try {
    const { name, price, stock, description, businessID } = req.body;
    // Create a new product instance
    const product = new Product({
      name,
      price,
      stock,
      images,
      description,
      businessID,
    });

    // Save the product to the database
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
    console.error(error);
  }
});

router.get("/products", async (req, res) => {
  try {
    const { businessID } = req.query;

    let products;
    if (businessID) {
      // Fetch products filtered by seller ID
      products = await Product.find({ businessID });
    } else {
      // Fetch all products
      products = await Product.find();
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find a product by its ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.put("/products/:id", upload.array("images"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description, businessID } = req.body;

    // Find the product by its ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update the product fields
    product.name = name;
    product.price = price;
    product.stock = stock;
    product.description = description;
    product.images = req.files.map((file) => file.filename);
    product.businessID = businessID;

    // Save the updated product
    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by its ID and remove it
    const deletedProduct = await Product.findByIdAndRemove(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(deletedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.post("/upload", upload.array("images"), async (req, res) => {
  try {
    res.json(req.files.map((file) => file.filename));
  } catch (error) {
    res.status(500).json({ error: "Failed to upload images" });
  }
});

export default router;
