import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AccountingModule } from './accounting/accounting.module';
import { SalesModule } from './sales/sales.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [CustomersModule, PrismaModule, AuthModule, AccountingModule, SalesModule, PurchasesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
