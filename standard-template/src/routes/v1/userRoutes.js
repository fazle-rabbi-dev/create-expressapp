import { Router } from "express";
import {
    registerUser,
    loginUser,
    confirmAccount,
    resendAccountConfirmationEmail,
    getUserProfile,
    getCurrentUser,
    changeCurrentPassword,
    requestResetPassword,
    resetPassword,
    refreshAccessToken,
    updateAccountDetails,
    changeCurrentEmail,
    confirmChangeEmail
} from "../../controllers/v1/userController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import VALIDATOR from "../../utils/validator.js";


const router = Router();

router.post("/register", VALIDATOR.register, registerUser);
router.post("/login", VALIDATOR.login, loginUser);
router.get("/confirm-account", confirmAccount);
router.get("/resend-confirmation-email", resendAccountConfirmationEmail);
router.get("/profile/:userId", getUserProfile);
router.get("/request-reset-password", VALIDATOR.validateEmailQueryParam, requestResetPassword);
router.patch("/reset-password", resetPassword);
router.patch("/confirm-change-email", confirmChangeEmail);

// secured routes
router.get("/current-user", verifyToken(), getCurrentUser);
router.patch("/change-password", VALIDATOR.changePassword, verifyToken(), changeCurrentPassword);
router.patch("/refresh-access-token", refreshAccessToken);
router.patch("/update-account", verifyToken(), updateAccountDetails);
router.patch("/change-email", VALIDATOR.changeEmail, verifyToken(), changeCurrentEmail);

export default router;
