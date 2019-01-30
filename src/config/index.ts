import * as dotenv from "dotenv";
import { ConnectionOptions } from "typeorm";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const CONNECTION_CONFIG: ConnectionOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(<string>process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: process.env.NODE_ENV === "dev",
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
};
