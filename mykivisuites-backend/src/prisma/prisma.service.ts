import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private pool: pkg.Pool | undefined;

	constructor() {
		const connectionString = process.env.DATABASE_URL;

		if (!connectionString) {
			super();
			console.warn(
				"DATABASE_URL is not defined. PrismaService will be initialized without an adapter.",
			);
		} else {
			const pool = new Pool({ connectionString });
			const adapter = new PrismaPg(pool);
			super({ adapter } as any);
			this.pool = pool;

			this.pool.on("error", (err) => {
				console.error("Unexpected error on idle PostgreSQL client", err);
			});
		}
	}

	async onModuleInit() {
		console.log("PrismaService: Initializing connection...");
		const connectionString = process.env.DATABASE_URL;

		if (!connectionString) {
			console.error("PrismaService: Cannot connect, DATABASE_URL is missing.");
			return;
		}

		try {
			// Use a timeout for the connection attempt to prevent hanging startup
			const connectPromise = this.$connect();
			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Connection timeout")), 10000),
			);

			await Promise.race([connectPromise, timeoutPromise]);
			console.log("PrismaService: Connected to database successfully.");
		} catch (error) {
			console.error("PrismaService: Connection failed or timed out:", error);
			// We don't rethrow here to allow the application to start and respond to health checks
			// even if the database is temporarily down.
		}
	}

	async onModuleDestroy() {
		try {
			await this.$disconnect();
			if (this.pool) {
				await this.pool.end();
			}
		} catch (error) {
			console.error("Error during PrismaService destruction:", error);
		}
	}
}
