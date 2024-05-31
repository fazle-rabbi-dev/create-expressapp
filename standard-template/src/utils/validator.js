import { body, query } from "express-validator";
import { VALIDATION_ERROR } from "../constants/index.js";

const register = [
    body("fullName").isLength({ min: 4 }).trim().escape().withMessage(VALIDATION_ERROR.fullName),
    body("username").isLength({ min: 3 }).trim().escape().withMessage(VALIDATION_ERROR.username),
    body("email").trim().isEmail().normalizeEmail().withMessage(VALIDATION_ERROR.email),
    body("password").isLength({ min: 6 }).trim().escape().withMessage(VALIDATION_ERROR.password)
];

const login = [
    body("username").isLength({ min: 3 }).trim().escape().withMessage(VALIDATION_ERROR.username),
    body("email").trim().isEmail().normalizeEmail().withMessage(VALIDATION_ERROR.email),
    body("password").isLength({ min: 6 }).trim().escape().withMessage(VALIDATION_ERROR.password)
];

const validateEmailQueryParam = [query("email").trim().isEmail().normalizeEmail().withMessage(VALIDATION_ERROR.email)];

const changePassword = [
    body("oldPassword").isLength({ min: 6 }).trim().escape().withMessage(VALIDATION_ERROR.password),
    body("newPassword").isLength({ min: 6 }).trim().escape().withMessage(VALIDATION_ERROR.password)
];

const changeEmail = [
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).trim().escape()
];

export default {
    register,
    login,
    validateEmailQueryParam,
    changePassword,
    changeEmail
};
