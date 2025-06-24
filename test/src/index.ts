import next from "next";
import { https } from "firebase-functions";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, conf: { distDir: ".next" } });
const handle = app.getRequestHandler();

export const ssr = https.onRequest((req, res) => {
    return app.prepare().then(() => handle(req, res));
});