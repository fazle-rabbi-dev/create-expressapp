import { Router } from "express";
import {
  loginAdmin,
  testAdmin
} from "../controllers/adminController.js";
import verifyToken from "../middlewares/verifyToken.js";
import VALIDATOR from "../utils/validator.js";

const router = Router();

router.post("/login", VALIDATOR.login, loginAdmin);
router.get("/test-admin", verifyToken("admin"), testAdmin);

export default router;
