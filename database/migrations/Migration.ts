import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1691580000000 implements MigrationInterface {
    name = 'InitialMigration1691580000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // User Table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL PRIMARY KEY,
                "email" VARCHAR NOT NULL UNIQUE,
                "password_hash" VARCHAR NOT NULL,
                "full_name" VARCHAR,
                "role" VARCHAR DEFAULT 'user',
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Workspace Table
        await queryRunner.query(`
            CREATE TABLE "workspaces" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR NOT NULL,
                "user_id" INTEGER REFERENCES users(id),
                "settings" JSONB DEFAULT '{}',
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Image Generation Table
        await queryRunner.query(`
            CREATE TABLE "image_generations" (
                "id" SERIAL PRIMARY KEY,
                "user_id" INTEGER REFERENCES users(id),
                "prompt" TEXT NOT NULL,
                "result_url" VARCHAR,
                "status" VARCHAR DEFAULT 'pending',
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Subscription Table
        await queryRunner.query(`
            CREATE TABLE "subscriptions" (
                "id" SERIAL PRIMARY KEY,
                "user_id" INTEGER REFERENCES users(id),
                "stripe_customer_id" VARCHAR,
                "stripe_subscription_id" VARCHAR,
                "plan_type" VARCHAR NOT NULL,
                "status" VARCHAR DEFAULT 'active',
                "current_period_end" TIMESTAMP,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TABLE "image_generations"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}`