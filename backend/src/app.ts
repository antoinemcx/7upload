import express, {
  Router,
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import * as uploadFile from "./routes/uploadFile.ts";
import * as downloadFile from "./routes/downloadFile.ts";

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
router.post("/upload", ...uploadFile.handlers);
router.get("/files/:hash", downloadFile.execute);
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
