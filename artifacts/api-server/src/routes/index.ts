import { Router, type IRouter } from "express";
import { internalToolsOnly } from "../auth";
import healthRouter from "./health";
import courseRouter from "./course";
import assignmentsRouter from "./assignments";
import practiceRouter from "./practice";
import practiceAssignmentsRouter from "./practiceAssignments";
import tutorRouter from "./tutor";
import detectionRouter from "./detection";
import analyticsRouter from "./analytics";
import diagnosticsRouter from "./diagnostics";
import reasoningRouter from "./reasoning";
import adminRouter from "./admin";
import downloadRouter from "./download";

const router: IRouter = Router();

router.use(healthRouter);
router.use(courseRouter);
router.use(assignmentsRouter);
router.use(practiceRouter);
router.use(practiceAssignmentsRouter);
router.use(tutorRouter);
// Detection scans, system diagnostics (bulk generation, reset, lecture
// expansion), and the grader lab are expensive and/or destructive. With no
// account system they are disabled in production and remain available locally.
// Path-scoped so it never touches the other routers mounted at "/".
router.use(["/detection", "/diagnostics", "/admin"], internalToolsOnly);
router.use(detectionRouter);
router.use(analyticsRouter);
router.use(diagnosticsRouter);
router.use(reasoningRouter);
router.use(adminRouter);
router.use(downloadRouter);

export default router;
