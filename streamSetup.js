import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function setupStream(app) {
    app.use("/stream", express.static(path.join(__dirname, "public/stream")));
}
