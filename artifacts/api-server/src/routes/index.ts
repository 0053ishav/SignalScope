import { Router, type IRouter } from "express";
import healthRouter from "./health";
import signalscopeRouter from "./signalscope";

const router: IRouter = Router();

router.use(healthRouter);
router.use(signalscopeRouter);

export default router;
