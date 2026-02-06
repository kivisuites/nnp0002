import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { AccountingModule } from '../accounting/accounting.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PurchasesController } from './purchases.controller';

@Module({
  imports: [AccountingModule, PrismaModule],
  providers: [PurchasesService],
  exports: [PurchasesService],
  controllers: [PurchasesController],
})
export class PurchasesModule {}
