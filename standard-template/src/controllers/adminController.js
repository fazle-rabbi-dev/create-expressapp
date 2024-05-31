import asyncHanlder from "express-async-handler";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import UserModel from "../models/UserModel.js"
import { generateValidationError, generateAccessAndRefereshTokens } from "../utils/helpers.js";

export const loginAdmin = asyncHanlder(async (req, res) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);

    const isUsernameValid = req.body.username && !errors.array().some(error => error.path === "username");
    const isEmailValid = req.body.email && !errors.array().some(error => error.path === "email");
    const isPasswordValid = req.body.password && !errors.array().some(error => error.path === "password");
    
    if (!isPasswordValid || (!isEmailValid && !isUsernameValid)) {
        
        // remove username validation error when email is present ....
        const filteredErrors = errors.errors.filter(item => {
          if(email?.length > 5){
            return item.path !== "username";
          }
          if (username){
            return item.path !== "email";
          }
          else{
            return item;
          }
        });
        
        throw new ApiError(
            400,
            "A username or email address & password is required to proceed.",
            generateValidationError(filteredErrors)
        );
    }
    
    const existingUser = await UserModel.findOne({
        $or: [{ username }, { email }]
    }).select("+authentication.password +authentication.role");
    
    if (!existingUser) {
        throw new ApiError(404, "Oops! We couldn't find a user with the provided email or username.");
    }
    
    if(existingUser.authentication.role !== "admin"){
      throw new ApiError(401, "Incorrect username or password. Please try again.");
    }
    
    const isPasswordCorrect = await existingUser.isPasswordCorrect(password);
    
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect username or password. Please try again.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(existingUser._id, "admin");
    
    const loggedInUserObject = existingUser.toObject();
    loggedInUserObject.authentication = {
      accessToken, refreshToken
    };

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: loggedInUserObject,
            },
            "Logged In Successfully as Admin."
        )
    );
});

export const testAdmin = asyncHanlder(async (req, res) => {
  res.status(200).json({
    ok: true
  })
})