import express from "express";
import routes from "./Routes";
import cors from 'cors';
import firebase from 'firebase-admin';

firebase.initializeApp({
    credential: firebase.credential.cert(require(process.env.FIREBASE_APPLICATION_CREDENTIALS!))
})

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || "*";

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin!)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use("/api", routes);

export default app;