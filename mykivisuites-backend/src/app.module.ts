import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";
import Redis from "ioredis";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CustomersModule } from "./customers/customers.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { AccountingModule } from "./accounting/accounting.module";
import { SalesModule } from "./sales/sales.module";
import { PurchasesModule } from "./purchases/purchases.module";

@Module({
	imports: [
		// Redis Caching Configuration
		CacheModule.registerAsync({
			isGlobal: true,
			useFactory: async () => {
				const redisUrl = process.env.REDIS_URL;
				if (!redisUrl) return {};
				return {
					store: await redisStore({
						url: redisUrl,
						ttl: 600, // 10 minutes default cache
					}),
				};
			},
		}),
		// Rate Limiting (Throttling) Configuration with Redis
		ThrottlerModule.forRootAsync({
			useFactory: () => {
				const redisUrl = process.env.REDIS_URL;
				return {
					throttlers: [
						{
							ttl: parseInt(process.env.APP_THROTTLE_TTL || "60", 10),
							limit: parseInt(process.env.APP_THROTTLE_LIMIT || "10", 10),
						},
					],
					storage: redisUrl
						? new ThrottlerStorageRedisService(new Redis(redisUrl))
						: undefined,
				};
			},
		}),
		CustomersModule,
		PrismaModule,
		AuthModule,
		AccountingModule,
		SalesModule,
		PurchasesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
