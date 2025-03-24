var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product');
let CategoryModel = require('../schemas/category');
const { check_authentication, check_authorization } = require('../utils/check_auth');

// Hàm xây dựng query cho filter tìm kiếm sản phẩm
function buildQuery(obj) {
  let result = {};
  if (obj.name) {
    result.name = new RegExp(obj.name, 'i');
  }
  result.price = {};
  if (obj.price) {
    result.price.$gte = obj.price.$gte || 0;
    result.price.$lte = obj.price.$lte || 10000;
  } else {
    result.price = { $gte: 0, $lte: 10000 };
  }
  return result;
}

// Route GET tất cả sản phẩm (không cần đăng nhập)
router.get('/', async function (req, res) {
  try {
    let products = await productModel.find(buildQuery(req.query)).populate("category");
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Route GET chi tiết sản phẩm theo ID
router.get('/:id', async function (req, res) {
  try {
    let product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ success: false, message: "ID không tồn tại" });
    }
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Route POST - Tạo sản phẩm mới (chỉ dành cho mod)
router.post('/', check_authentication, check_authorization(['mod']), async function (req, res) {
  try {
    let cate = await CategoryModel.findOne({ name: req.body.category });
    if (!cate) {
      return res.status(400).send({ success: false, message: "Category không hợp lệ" });
    }

    let newProduct = new productModel({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      category: cate._id
    });

    await newProduct.save();
    res.status(201).send({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Route PUT - Cập nhật sản phẩm (chỉ dành cho mod)
router.put('/:id', check_authentication, check_authorization(['mod']), async function (req, res) {
  try {
    let updateObj = {};
    if (req.body.name) updateObj.name = req.body.name;
    if (req.body.price) updateObj.price = req.body.price;
    if (req.body.quantity) updateObj.quantity = req.body.quantity;

    if (req.body.category) {
      let cate = await CategoryModel.findOne({ name: req.body.category });
      if (!cate) {
        return res.status(400).send({ success: false, message: "Category không hợp lệ" });
      }
      updateObj.category = cate._id;
    }

    let updatedProduct = await productModel.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    if (!updatedProduct) {
      return res.status(404).send({ success: false, message: "ID không tồn tại" });
    }

    res.status(200).send({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Route DELETE - Xóa sản phẩm (chỉ dành cho admin)
router.delete('/:id', check_authentication, check_authorization(['admin']), async function (req, res) {
  try {
    let product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ success: false, message: "ID không tồn tại" });
    }

    let deletedProduct = await productModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.status(200).send({ success: true, data: deletedProduct });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
