import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js";
import { dirname, join } from "path";
import MediaRouter from "./routes/mediaRoutes/index.js";

const server = express();

const port = process.env.PORT || 3001;

const whitelist = [
  process.env.FRONTEND_DEV_URL,
  process.env.FRONTEND_CLOUD_URL,
];

const corsOptions = {
  origin: function (origin, next) {
    console.log("ORIGIN", origin);
    if (whitelist.indexOf(origin) !== -1) {
      next(null, true);
    } else {
      next(new Error("CORS TROUBLES!!!!!"));
    }
  },
};
// server.use(cors(corsOptions));
server.use(cors());
server.use(express.json());

server.use("/media", MediaRouter);

server.use(notFoundErrorHandler);
server.use(badRequestErrorHandler);
server.use(forbiddenErrorHandler);
server.use(catchAllErrorHandler);

// console.log(listEndpoints(server));
console.table(listEndpoints(server));

server.listen(port, () => {
  console.log("Server is running on port: ", port);
});
