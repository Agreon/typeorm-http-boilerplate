import * as bodyParser from "body-parser";
import * as express from "express";
import * as cors from "cors";
import "reflect-metadata";
import { createConnection } from "typeorm";
import Controllers from "./controller";

const port = process.env.port || 3000;

createConnection()
  .then(async () => {
    // create express app
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors());

    // Register all application routes
    Controllers.forEach(controller => controller.init(app));

    // run app
    app.listen(port);
    console.log("Express application is up and running on port 3000");
  })
  .catch(error => console.log("TypeORM connection error: ", error));
