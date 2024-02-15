import User from "../database/User.js";
import bcrypt from "bcryptjs";
import CustomError from "../utils/CustomError.js";
import { validateUserId } from "../utils/helpers.js";
import { validationResult } from "express-validator";


// ==========================================================================================
// Create User Account
// ==========================================================================================
const createNewUser = async req => {
    const { name, username, email, password } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            throw new CustomError(
                400,
                "Oops! The following fields are required in the request body: name (4 characters), username (3 characters), email, password (at least 6 characters long)."
            );
        }

        // Another way to send error response
        /*if (!errors.isEmpty()) {
            errors.array().forEach(field => {
                switch (field.path) {
                    case "name":
                        throw new CustomError(
                            400,
                            field.msg
                        );
                        
                    
                    case "username":
                        throw new CustomError(
                            400,
                            "Username must be at least 3 characters."
                        );
                        
                    
                    case "email":
                        throw new CustomError(
                            400,
                            "Email is required.Please provide a valid email."
                        );
                        
                    default:
                        throw new CustomError(
                            400,
                            "Password must be at least 6 characters."
                        );
                }
            });
        }*/

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const userData = {
            name,
            username,
            email,
            password: hash
        };
        const user = await User.createNewUser(userData);

        return user;
    } catch (error) {
        throw error;
    }
};

// ==========================================================================================
// Login
// ==========================================================================================
const login = async req => {
    try {
        const { username, email, password } = req.body;
        const fields = [username, email, password];

        const errors = validationResult(req);
        const isUsernameValid =
            req.body.username &&
            !errors.array().some(error => error.path === "username");
        const isEmailValid =
            req.body.email &&
            !errors.array().some(error => error.path === "email");
        const isPasswordValid =
            req.body.password &&
            !errors.array().some(error => error.path === "password");

        if (!isPasswordValid || (!isEmailValid && !isUsernameValid)) {
            throw new CustomError(
                400,
                "Please provide a valid email or username (at least 3 characters) and a password (at least 6 characters)."
            );
        }

        const user = await User.login(req.body);
        return user;
    } catch (error) {
        throw error;
    }
};

// ==========================================================================================
// Confirm User Account
// ==========================================================================================
const confirmAccount = async query => {
    const { userId, token } = query;

    try {
        if (!userId || !token) {
            throw new CustomError(
                400,
                "Please provide both userId and token parameters in the URL."
            );
        }

        const status = await User.confirmAccount(userId, token);
        return status;
    } catch (error) {
        throw error;
    }
};

// ==========================================================================================
// Find User By Id
// ==========================================================================================
const getUserById = async req => {
    const { userId } = req.params;
    const isOwner = req?.user?._id === userId;

    try {
        if (!validateUserId(userId)) {
            throw new CustomError(
                400,
                "Missing or invalid userid. Please check the userid in the URL parameter."
            );
        }

        if (!isOwner) {
            throw new CustomError(
                401,
                "Unauthorized access: You are not the owner and do not have permission to access this resource."
            );
        }

        const user = await User.getUserById(userId);
        return user;
    } catch (error) {
        throw error;
    }
};

// ==========================================================================================
// Change User Password
// ==========================================================================================
const changePassword = async req => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword?.trim() || !newPassword?.trim()) {
            throw new CustomError(
                400,
                "Both old password and new password are required. Please provide values for both fields in request body."
            );
        }

        if (oldPassword.length < 6 || newPassword.length < 6) {
            throw new CustomError(400, "Password must be at least 6 digit.");
        }

        await User.changePassword(oldPassword, newPassword, req);
    } catch (error) {
        throw error;
    }
};

// ==========================================================================================
// Update Account
// ==========================================================================================
const updateAccount = async req => {
    const { name } = req.body;

    try {
        if (!name) {
            throw new CustomError(
                400,
                "Name is required.Check name field in request body."
            );
        }

        const user = await User.updateAccount(req, name);
        return user;
    } catch (error) {
        throw error;
    }
};

export default {
    createNewUser,
    login,
    confirmAccount,
    getUserById,
    changePassword,
    updateAccount
};
