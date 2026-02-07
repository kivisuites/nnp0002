import {
  IsString,
  IsDate,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateInvoiceDto {
  @IsString()
  number: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsNumber()
  customerId: number;

  @IsNumber()
  tenantId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
