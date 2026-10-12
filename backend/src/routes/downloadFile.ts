import type { Request, Response } from "express";

/**
 * GET /files/:uuid
 * Optional header:
 * - X-File-Password: string = password if the file is protected
 * Responses:
 * - 200: file content
 * - 401: missing or invalid password
 * - 404: file not found
 * - 410: file expired or already downloaded (single use)
 */
export async function execute(req: Request<{ uuid: string }>, res: Response) {
  const { uuid } = req.params;
  const password = req.get("X-File-Password");

  // TODO: get the file metadata from the uuid in DB
  // TODO: check expiration (410 if expired)
  // TODO: hash then check the password if required (401 if invalid)
  // TODO: send the file with res.download()
  // TODO: delete the file if single use

  res.status(501).json({ error: "Not yet implemented." });
}
