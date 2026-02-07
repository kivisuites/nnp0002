import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async createJournalEntry(dto: CreateJournalEntryDto, tx?: any) {
    const { date, reference, tenantId, entries } = dto;

    // Validate that debits = credits
    const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException(
        `Journal entry must be balanced. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`,
      );
    }

    const execute = async (transaction: any) => {
      const journalEntry = await transaction.journalEntry.create({
        data: {
          date,
          reference,
          tenantId,
        },
      });

      const ledgerEntries = await Promise.all(
        entries.map((entry) =>
          transaction.generalLedgerEntry.create({
            data: {
              date,
              accountId: entry.accountId,
              debit: entry.debit,
              credit: entry.credit,
              reference: entry.reference || reference,
              tenantId,
            },
          }),
        ),
      );

      return { journalEntry, ledgerEntries };
    };

    if (tx) {
      return execute(tx);
    } else {
      return await this.prisma.$transaction(async (newTx) => {
        return execute(newTx);
      });
    }
  }

  async getAccountBalance(accountId: number, tenantId: number) {
    const entries = await this.prisma.generalLedgerEntry.findMany({
      where: {
        accountId,
        tenantId,
      },
    });

    const balance = entries.reduce(
      (sum: number, entry: any) =>
        sum + Number(entry.debit) - Number(entry.credit),
      0,
    );

    return balance;
  }
}
