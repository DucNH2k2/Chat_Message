import dotenv from 'dotenv';
import http from "http";

dotenv.config();

(async () => {
    const db = await import("./config/db");
    await db.connectDB();

    const { connectRedis } = await import("./config/redis");
    await connectRedis();

    const app = await import("./app");
    const server = http.createServer(app.default);

    server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
})();