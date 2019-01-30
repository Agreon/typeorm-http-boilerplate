import * as bodyParser from "body-parser";
import * as express from "express";
import * as cors from "cors";
import "reflect-metadata";
import { createConnection } from "typeorm";

import Controllers from "./controller";
import { CONNECTION_CONFIG } from "./config";

createConnection(CONNECTION_CONFIG)
  .then(async () => {
    // create express app
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors());

    // Register all application routes
    Controllers.forEach(controller => controller.init(app));

    // run app
    const port: number = parseInt(<string>process.env.APP_PORT, 10) || 3000;

    app.listen(port);
    console.log(`Express application is up and running on port ${port}`);
  })
  .catch(error => console.log("TypeORM connection error: ", error));
