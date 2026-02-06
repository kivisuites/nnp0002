import {
  IsString,
  IsDate,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  number: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  supplierId: number;

  @IsNumber()
  tenantId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}
