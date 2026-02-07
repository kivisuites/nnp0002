import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool | undefined;

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      super();
      console.warn(
        'DATABASE_URL is not defined. PrismaService will be initialized without an adapter.',
      );
    } else {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      super({ adapter });
      this.pool = pool;

      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client', err);
      });
    }
  }

  async onModuleInit() {
    console.log('PrismaService: Initializing connection...');
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error('PrismaService: Cannot connect, DATABASE_URL is missing.');
      return;
    }

    const maxRetries = 5;
    let currentRetry = 0;
    const retryDelay = 5000; // 5 seconds

    while (currentRetry < maxRetries) {
      try {
        // Use a timeout for the connection attempt to prevent hanging startup
        const connectPromise = this.$connect();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 10000),
        );

        await Promise.race([connectPromise, timeoutPromise]);
        console.log('PrismaService: Connected to database successfully.');
        return; // Success!
      } catch (error) {
        currentRetry++;
        console.error(
          `PrismaService: Connection failed (Attempt ${currentRetry}/${maxRetries}):`,
          error instanceof Error ? error.message : error,
        );

        if (currentRetry < maxRetries) {
          console.log(`Retrying in ${retryDelay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    console.error(
      'PrismaService: Could not connect to database after maximum retries.',
    );
    // We don't throw to allow the health check to pass, but the app will be in a degraded state
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      if (this.pool) {
        await this.pool.end();
      }
    } catch (error) {
      console.error('Error during PrismaService destruction:', error);
    }
  }
}
