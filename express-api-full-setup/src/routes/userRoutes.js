import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body, query } from "express-validator";
import {
    createNewUser,
    login,
    confirmAccount,
    getUserById,
    changePassword,
    updateAccount
} from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

router.post(
    "/signup",
    [
        body("name")
            .isLength({ min: 4 })
            .trim()
            .escape()
            .withMessage(
                "Name is required and must be at least 4 characters long."
            ),
        body("username").isLength({ min: 3 }).trim().escape(),
        body("email").trim().isEmail().normalizeEmail(),
        body("password").isLength({ min: 6 }).trim().escape()
    ],
    createNewUser
);
router.post(
    "/login",
    [
        body("username").isLength({ min: 3 }).trim().escape(),
        body("email").trim().isEmail().normalizeEmail(),
        body("password").isLength({ min: 6 }).trim().escape()
    ],
    login
);
router.get("/confirm-account", confirmAccount);
router.get("/:userId", authMiddleware, getUserById);
router.patch("/change-password", authMiddleware, changePassword);
router.patch("/update-account", authMiddleware, updateAccount);


// ==========================================================================================
// Testing route for experimenting with file uploading
// ==========================================================================================
router.get("/test/upload", (req, res) => {
    res.send(`
    <form action="/api/users/test/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="avatar">
      <input type="submit" value="Upload">
    </form>
  `);
});

router.post("/test/upload", upload.single("avatar"), async (req, res) => {
    const filePath = req.file.path;

    try {
        await uploadOnCloudinary(filePath);

        res.status(200).json({
            status: "Success",
            message: "File uploaded successfully."
        });
    } catch (error) {
        res.status(200).json({
            status: "Failed",
            message: error?.message || "Something went wrong!"
        });
    }
});

export default router;
