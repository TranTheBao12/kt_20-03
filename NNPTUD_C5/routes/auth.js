var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
let { check_authentication } = require('../utils/check_auth');
let bcrypt = require('bcrypt');

/* POST login. */
router.post('/login', async function (req, res, next) {
    try {
        let body = req.body;
        let username = body.username;
        let password = body.password;
        let result = await userController.Login(username, password);
        let token = jwt.sign({
            id: result._id,
            expire: new Date(Date.now() + 24 * 3600 * 1000)
        }, constants.SECRET_KEY);
        CreateSuccessRes(res, 200, token);
    } catch (error) {
        next(error);
    }
});

/* POST signup. */
router.post('/signup', async function (req, res, next) {
    try {
        let body = req.body;
        let username = body.username;
        let password = body.password;
        let email = body.email;
        let result = await userController.CreateAnUser(username, password, email, 'user');
        let token = jwt.sign({
            id: result._id,
            expire: new Date(Date.now() + 24 * 3600 * 1000)
        }, constants.SECRET_KEY);
        CreateSuccessRes(res, 200, token);
    } catch (error) {
        next(error);
    }
});

/* GET me (No authentication required). */
router.get('/me', async function (req, res, next) {
    CreateSuccessRes(res, 200, req.user); // Không cần xác thực nhưng đảm bảo token hợp lệ cho request tới '/me'
});

/* POST change password (No authentication required). */
router.post('/changepassword', async function (req, res, next) {
    let body = req.body;
    let oldpassword = body.oldpassword;
    let newpassword = body.newpassword;

    // Đảm bảo rằng không cần xác thực token ở đây
    if (bcrypt.compareSync(oldpassword, req.user.password)) {
        let user = req.user;
        user.password = newpassword;
        await user.save();
        CreateSuccessRes(res, 200, user);
    } else {
        next(new Error("Old password is incorrect"));
    }
});

// Middleware để kiểm tra xác thực cho các route còn lại
router.use(check_authentication);  // Đảm bảo các route dưới đây yêu cầu phải xác thực token

/* Các route cần bảo vệ với xác thực */
router.get('/protected', async function (req, res, next) {
    // Đây là một route bảo vệ mà yêu cầu người dùng phải có token hợp lệ.
    CreateSuccessRes(res, 200, { message: "You have access to this protected route!" });
});

module.exports = router;
