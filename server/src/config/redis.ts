import { createClient } from "redis";

const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD } = process.env;

export const redisClient = createClient({
    socket: {
        port: Number(process.env.REDIS_PORT) || 6379,
        host: process.env.REDIS_HOST || "redis",
    },
    password: process.env.REDIS_PASSWORD || '123456',
});


export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Redis connected");

        await redisClient.setEx("test", 10, 'test');
        console.log("Test redis connected")
    } catch (err) {
        console.error("Redis connection error:", err);
        process.exit(1);
    }
}