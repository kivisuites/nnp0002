import { IsString, IsDate, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class LedgerEntryDto {
  @IsNumber()
  accountId: number;

  @IsNumber()
  debit: number;

  @IsNumber()
  credit: number;

  @IsString()
  @IsOptional()
  reference?: string;
}

export class CreateJournalEntryDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsNumber()
  tenantId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LedgerEntryDto)
  entries: LedgerEntryDto[];
}
