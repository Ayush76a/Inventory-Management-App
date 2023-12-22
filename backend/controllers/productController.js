const asyncHandler = require("express-async-handler")
const Product = require("../userModels/productModel.js")

export const createProduct = asyncHandler(async(req,res) =>{
    res.send("Product Created");
})