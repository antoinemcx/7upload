import type { Request, Response } from "express";

/** POST /files body. */
export interface UploadFileBody {
  /** Required. File name */
  name: string;
  /** Required. File content encoded in base64 */
  content: string;
  /**
   * File retention duration in seconds.
   * This field cannot be set if singleUse is true.
   */
  expiresIn?: number;
  /** True if the file is deleted after the first download */
  singleUse?: boolean;
  /** Optional. Password to protect the file for download */
  password?: string;
}

export async function execute(
  req: Request<{}, {}, Partial<UploadFileBody>>,
  res: Response,
) {
  const { name, content, expiresIn, singleUse, password } = req.body ?? {};
  await validateRequest(req.body, res);

  // TODO: generate a unique uuid for the file
  // TODO: hash the password if provided (never store it in plain text)
  // TODO: save the metadata (name, expiration, single use, password)
  // TODO: store file
  const uuid = "stub";

  res
    .status(201)
    .json({ uuid, link: `${req.protocol}://${req.get("host")}/files/${uuid}` });
}

async function validateRequest(body: Partial<UploadFileBody>, res: Response) {
  const { name, content, expiresIn, singleUse, password } = body ?? {};

  if (typeof name !== "string" || name.length === 0 || typeof content !== "string") {
    res.status(400).json({ error: "The fields 'name' and 'content' are required." });
    return;
  }
  if (expiresIn !== undefined && (typeof expiresIn !== "number" || expiresIn <= 0)) {
    res.status(400).json({ error: "'expiresIn' must be a positive number" });
    return;
  }
  if (singleUse !== undefined && typeof singleUse !== "boolean") {
    res.status(400).json({ error: "'singleUse' must be a boolean" });
    return;
  }
  if (singleUse && expiresIn !== undefined) {
    res.status(400).json({ error: "'expiresIn' cannot be set if 'singleUse' is true" });
    return;
  }
  if (singleUse === undefined && expiresIn === undefined) {
    res
      .status(400)
      .json({ error: "Either 'singleUse' must be true or 'expiresIn' must be set" });
    return;
  }
  if (password !== undefined && typeof password !== "string") {
    res.status(400).json({ error: "'password' must be a string" });
    return;
  }
}
