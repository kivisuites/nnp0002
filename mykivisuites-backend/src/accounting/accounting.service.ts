import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJournalEntryDto } from "./dto/create-journal-entry.dto";

@Injectable()
export class AccountingService {
	constructor(private prisma: PrismaService) {}

	async createJournalEntry(dto: CreateJournalEntryDto) {
		const { date, reference, tenantId, entries } = dto;

		// Validate that debits = credits
		const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
		const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);

		if (Math.abs(totalDebit - totalCredit) > 0.001) {
			throw new BadRequestException(
				`Journal entry must be balanced. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`,
			);
		}

		return await (this.prisma as any).$transaction(async (tx: any) => {
			const journalEntry = await tx.journalEntry.create({
				data: {
					date,
					reference,
					tenantId,
				},
			});

			const ledgerEntries = await Promise.all(
				entries.map((entry) =>
					tx.generalLedgerEntry.create({
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
		});
	}

	async getAccountBalance(accountId: number, tenantId: number) {
		const entries = await (this.prisma as any).generalLedgerEntry.findMany({
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
