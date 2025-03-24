var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
const { check_authentication, check_authorization } = require('../utils/check_auth');
// Middleware kiểm tra xác thực người dùng (Authentication)


// Middleware kiểm tra người dùng có thể truy cập dữ liệu của chính họ
const check_self_access = (req, res, next) => {
  if (req.user.id === req.params.id) {  // Kiểm tra nếu ID yêu cầu trùng với ID người dùng
    return next();  // Cho phép truy cập vào tài khoản của chính mình
  }
  return res.status(403).send({ success: false, message: 'Không có quyền truy cập vào dữ liệu của người khác' });
};

// Route GET tất cả người dùng (chỉ cho phép mod và admin)
router.get('/', check_authentication, async function (req, res, next) {
  try {
    if (req.user.role === 'mod' || req.user.role === 'admin') {
      let users = await userController.GetAllUser();
      CreateSuccessRes(res, 200, users);
    } else {
      res.status(403).send({ success: false, message: 'Không có quyền truy cập' });
    }
  } catch (error) {
    next(error);
  }
});

// Route GET thông tin người dùng theo id (mod có thể xem ngoại trừ chính họ)
router.get('/:id', check_authentication, async function (req, res, next) {
  try {
    if (req.user.role === 'mod') {
      if (req.user.id === req.params.id) {  // Nếu là chính họ, cho phép truy cập
        let user = await userController.GetUserById(req.params.id);
        CreateSuccessRes(res, 200, user);
      } else {
        res.status(403).send({ success: false, message: 'Không có quyền xem thông tin người dùng khác' });
      }
    } else if (req.user.role === 'admin') {
      let user = await userController.GetUserById(req.params.id);
      CreateSuccessRes(res, 200, user);
    } else {
      res.status(403).send({ success: false, message: 'Không có quyền truy cập' });
    }
  } catch (error) {
    CreateErrorRes(res, 404, error);
  }
});

// Route POST tạo người dùng mới (chỉ admin)
router.post('/', check_authentication, check_authorization('admin'), async function (req, res, next) {
  try {
    let body = req.body;
    let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
    CreateSuccessRes(res, 200, newUser);
  } catch (error) {
    next(error);
  }
});

// Route PUT cập nhật thông tin người dùng (chỉ admin)
router.put('/:id', check_authentication, check_authorization('admin'), async function (req, res, next) {
  try {
    let updatedUser = await userController.UpdateUser(req.params.id, req.body);
    CreateSuccessRes(res, 200, updatedUser);
  } catch (error) {
    next(error);
  }
});

// Route DELETE xóa người dùng (chỉ admin)
router.delete('/:id', check_authentication, check_authorization('admin'), async function (req, res, next) {
  try {
    let deletedUser = await userController.DeleteUser(req.params.id);
    CreateSuccessRes(res, 200, deletedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
