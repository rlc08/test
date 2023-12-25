import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { createServer, proxy } from "aws-serverless-express";
import connectDB from "./config/db.js";
import userModel from "./models/userModel.js";
import clubModel from "./models/clubModel.js";
import userAuthRoutes from "./routes/userAuthRoute.js";
import eventRoutes from "./routes/eventRoute.js";
import clubRoutes from "./routes/clubRoute.js";
import { requireSignIn } from "./middlewares/userAuthMiddleware.js";

const corsOptions = {
    origin: ["https://clubhubb.netlify.app"],
};

app.use(cors(corsOptions));
// configure env
dotenv.config();

// database config
connectDB();

// rest object
const app = express();
// middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/v1/user-auth", userAuthRoutes);
app.use("/api/v1/event", requireSignIn, eventRoutes);
app.use("/api/v1/club", requireSignIn, clubRoutes);

// routes

// rest api
app.get("/", (req, res) => {
    res.send("<h1>Welcome to ecommerce app</h1>");
});

// If running in a Netlify function environment, wrap the app
if (process.env.NETLIFY_FUNCTION === "true") {
    exports.handler = async (event, context) => {
        // Create a server and proxy to express app
        const server = createServer(app);
        return proxy(server, event, context, "PROMISE").promise;
    };
} else {
    // If not running in Netlify function environment, start the server
    // PORT
    const PORT = process.env.PORT || 8080;

    // run listen
    app.listen(PORT, () => {
        console.log(
            `Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`
                .bgCyan.white
        );
    });
}
