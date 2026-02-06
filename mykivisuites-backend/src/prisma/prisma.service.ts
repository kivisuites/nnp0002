import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor() {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			console.error("DATABASE_URL is not defined in environment variables");
		}
		const pool = new Pool({ connectionString });

		pool.on("error", (err) => {
			console.error("Unexpected error on idle client", err);
		});

		const adapter = new PrismaPg(pool);
		super({ adapter });
	}

	async onModuleInit() {
		try {
			console.log("Connecting to database...");
			await this.$connect();
			console.log("Database connected successfully");
		} catch (error) {
			console.error("Failed to connect to database:", error);
			throw error;
		}
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
