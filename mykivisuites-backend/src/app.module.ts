import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AccountingModule } from './accounting/accounting.module';
import { SalesModule } from './sales/sales.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [
    // Rate Limiting (Throttling) Configuration
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.APP_THROTTLE_TTL || '60', 10),
      limit: parseInt(process.env.APP_THROTTLE_LIMIT || '10', 10),
    }]),
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
