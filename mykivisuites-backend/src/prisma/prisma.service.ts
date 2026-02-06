import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('DATABASE_URL is not defined, Prisma might fail to connect.');
    }
    
    const pool = new Pool({ connectionString });
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });

    const adapter = new PrismaPg(pool);
    // @ts-ignore - Prisma 7 adapter typing might be strict
    super({ adapter });
  }

  async onModuleInit() {
    console.log('PrismaService: Initializing connection...');
    try {
      // @ts-ignore
      await this.$connect();
      console.log('PrismaService: Connected to database successfully.');
    } catch (error) {
      console.error('PrismaService: Connection failed:', error);
      // We don't throw here to allow the app to start and show healthcheck status
      // though most features will fail.
    }
  }

  async onModuleDestroy() {
    // @ts-ignore
    await this.$disconnect();
  }
}
