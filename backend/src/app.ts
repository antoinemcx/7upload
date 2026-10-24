import express, {
  Router,
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cron from "node-cron";
import * as uploadFiles from "./routes/uploadFiles.ts";
import * as downloadFile from "./routes/downloadFile.ts";
import * as folderInfo from "./routes/folderInfo.ts";

import { deleteExpiredAndLostFiles } from "./utils/fileExpiration.ts";

let cleanupInProgress = false;

async function runFileCleanup() {
  if (cleanupInProgress) {
    console.warn("File cleanup skipped because a previous cleanup is still running.");
    return;
  }

  cleanupInProgress = true;
  try {
    await deleteExpiredAndLostFiles();
  } catch (error) {
    console.error("Failed to clean expired files:", error);
  } finally {
    cleanupInProgress = false;
  }
}

// Run once when the backend starts, then at the beginning of every hour.
void runFileCleanup();
cron.schedule("0 * * * *", () => {
  void runFileCleanup();
});

const PORT = Number(process.env.PORT ?? 3000);

const app: Express = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-File-Password");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: "50mb" })); // file upload limit

/* Routing */
const router = Router();
router.post("/upload", ...uploadFiles.handlers);
router.get("/folders/:uuid", ...folderInfo.handlers);
router.get("/files/:uuid", ...downloadFile.handlers);
app.use(router);

/* Error handling */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(
  (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const status = err.status ?? 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? "Internal error" : err.message });
  },
);

app.listen(PORT, () => {
  console.log(`API started at http://localhost:${PORT}`);
});
