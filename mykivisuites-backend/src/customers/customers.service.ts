import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomersService {
	constructor(private prisma: PrismaService) {}

	async create(createCustomerDto: CreateCustomerDto) {
		return await this.prisma.customer.create({
			data: createCustomerDto,
		});
	}

	async findAll() {
		return await this.prisma.customer.findMany({
			include: {
				tenant: true,
			},
		});
	}

	async findOne(id: number) {
		return await this.prisma.customer.findUnique({
			where: { id },
			include: {
				tenant: true,
			},
		});
	}

	async update(id: number, updateCustomerDto: UpdateCustomerDto) {
		return await this.prisma.customer.update({
			where: { id },
			data: updateCustomerDto,
		});
	}

	async remove(id: number) {
		return await this.prisma.customer.delete({
			where: { id },
		});
	}
}
