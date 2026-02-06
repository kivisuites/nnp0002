import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private accountingService: AccountingService,
  ) {}

  async createPurchaseOrder(dto: CreatePurchaseOrderDto) {
    const { tenantId, items, supplierId, number, date } = dto;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Calculate total amount
      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      // 2. Create Purchase Order
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          number,
          date,
          supplierId,
          tenantId,
          totalAmount,
          status: 'ORDERED',
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
              increment: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: 'IN',
            reference: `PO ${number}`,
            tenantId,
          },
        });
      }

      // 4. Create Journal Entry (Double Entry)
      // Debit: Inventory (1400)
      // Credit: Accounts Payable (2000)

      const inventoryAccount = await tx.account.findFirst({
        where: { code: '1400', tenantId },
      });
      const apAccount = await tx.account.findFirst({
        where: { code: '2000', tenantId },
      });

      if (!inventoryAccount || !apAccount) {
        throw new NotFoundException(
          'Required accounts (Inventory or Accounts Payable) not found',
        );
      }

      await this.accountingService.createJournalEntry({
        date,
        reference: `PO ${number}`,
        tenantId,
        entries: [
          {
            accountId: inventoryAccount.id,
            debit: totalAmount,
            credit: 0,
            reference: `PO ${number}`,
          },
          {
            accountId: apAccount.id,
            debit: 0,
            credit: totalAmount,
            reference: `PO ${number}`,
          },
        ],
      });

      return purchaseOrder;
    });
  }
}
