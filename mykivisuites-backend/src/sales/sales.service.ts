import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private accountingService: AccountingService,
  ) {}

  async createInvoice(dto: CreateInvoiceDto) {
    const { tenantId, items, customerId, number, date, dueDate } = dto;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Calculate total amount
      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      // 2. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          number,
          date,
          dueDate,
          customerId,
          tenantId,
          totalAmount,
          status: 'ISSUED',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.quantity * item.unitPrice,
              tenantId,
            })),
          },
        },
        include: { items: true },
      });

      // 3. Update Inventory and Create Stock Movements
      for (const item of items) {
        await tx.product.update({
          where: { id_tenantId: { id: item.productId, tenantId } },
          data: {
            stockLevel: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: 'OUT',
            reference: `Invoice ${number}`,
            tenantId,
          },
        });
      }

      // 4. Create Journal Entry (Double Entry)
      // Debit: Accounts Receivable (1200)
      // Credit: Sales Revenue (4000)

      const arAccount = await tx.account.findFirst({
        where: { code: '1200', tenantId },
      });
      const salesAccount = await tx.account.findFirst({
        where: { code: '4000', tenantId },
      });

      if (!arAccount || !salesAccount) {
        throw new NotFoundException(
          'Required accounts (Accounts Receivable or Sales Revenue) not found',
        );
      }

      await this.accountingService.createJournalEntry(
        {
          date,
          reference: `Invoice ${number}`,
          tenantId,
          entries: [
            {
              accountId: arAccount.id,
              debit: totalAmount,
              credit: 0,
              reference: `Invoice ${number}`,
            },
            {
              accountId: salesAccount.id,
              debit: 0,
              credit: totalAmount,
              reference: `Invoice ${number}`,
            },
          ],
        },
        tx,
      );

      return invoice;
    });
  }
}
