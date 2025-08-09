import { DataSourceOptions } from "typeorm";

const config: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: ["database/entities/**/*.ts"],
    migrations: ["database/migrations/**/*.ts"],
    subscribers: ["database/subscribers/**/*.ts"],
    migrationsRun: true
};

export default config;