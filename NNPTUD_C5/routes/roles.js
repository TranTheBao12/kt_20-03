var express = require('express');
var router = express.Router();
let roleController = require('../controllers/roles');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth'); // Dùng middleware để kiểm tra quyền
let constants = require('../utils/constants');

// Route GET tất cả các vai trò - Không yêu cầu quyền
router.get('/', async function(req, res, next) {
    try {
        let roles = await roleController.GetAllRole();
        CreateSuccessRes(res, 200, roles);
    } catch (error) {
        next(error);
    }
});

// Route GET thông tin vai trò theo ID - Không yêu cầu quyền
router.get('/:id', async function(req, res, next) {
    try {
        let role = await roleController.GetRoleById(req.params.id);
        CreateSuccessRes(res, 200, role);
    } catch (error) {
        next(error);
    }
});

// Route POST tạo vai trò mới - Chỉ cho phép admin
router.post('/', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let newRole = await roleController.CreateRole(req.body.name);
        CreateSuccessRes(res, 200, newRole);
    } catch (error) {
        next(error);
    }
});

// Route PUT cập nhật vai trò - Chỉ cho phép admin
router.put('/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let updatedRole = await roleController.UpdateRole(req.params.id, req.body.name);
        CreateSuccessRes(res, 200, updatedRole);
    } catch (error) {
        next(error);
    }
});

// Route DELETE xóa vai trò - Chỉ cho phép admin
router.delete('/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let deletedRole = await roleController.DeleteRole(req.params.id);
        CreateSuccessRes(res, 200, deletedRole);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
