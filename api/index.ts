// Vercel serverless function: serves every /api/* route (see vercel.json) with the
// same Express app that server.ts runs locally and on Render.
import { createApp } from "../app.js";

export default createApp();
