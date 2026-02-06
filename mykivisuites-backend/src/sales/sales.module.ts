import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { AccountingModule } from '../accounting/accounting.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesController } from './sales.controller';

@Module({
  imports: [AccountingModule, PrismaModule],
  providers: [SalesService],
  exports: [SalesService],
  controllers: [SalesController],
})
export class SalesModule {}
