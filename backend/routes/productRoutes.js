const express = require("express");
const { createProduct } = require("../controllers/productController");
const protect = require("../controllers/authMiddleware");
const Router = express.Router;

Router.post("/",protect, createProduct);