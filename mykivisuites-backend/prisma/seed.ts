import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	const hashedPassword = await bcrypt.hash("admin123", 10);

	// Create default tenant
	const tenant = await prisma.tenant.upsert({
		where: { subdomain: "admin" },
		update: {},
		create: {
			name: "Kivisuites Admin",
			subdomain: "admin",
		},
	});

	// Create admin user
	const admin = await prisma.user.upsert({
		where: { email: "admin@kivisuites.com" },
		update: {},
		create: {
			email: "admin@kivisuites.com",
			password: hashedPassword,
			firstName: "Admin",
			lastName: "User",
			role: "ADMIN",
			tenantId: tenant.id,
		},
	});

	// Create some sample customers
	await prisma.customer.createMany({
		data: [
			{ name: "John Doe", email: "john@example.com", tenantId: tenant.id },
			{ name: "Jane Smith", email: "jane@example.com", tenantId: tenant.id },
		],
	});

	// Create default units
	const unitPcs = await prisma.unit.create({
		data: {
			name: "Pcs",
			tenantId: tenant.id,
		},
	});

	// Create default accounts
	const accounts = await Promise.all([
		prisma.account.create({
			data: {
				name: "Accounts Receivable",
				code: "1200",
				type: "ASSET",
				tenantId: tenant.id,
			},
		}),
		prisma.account.create({
			data: {
				name: "Sales Revenue",
				code: "4000",
				type: "REVENUE",
				tenantId: tenant.id,
			},
		}),
		prisma.account.create({
			data: {
				name: "Inventory",
				code: "1400",
				type: "ASSET",
				tenantId: tenant.id,
			},
		}),
		prisma.account.create({
			data: {
				name: "Cost of Goods Sold",
				code: "5000",
				type: "EXPENSE",
				tenantId: tenant.id,
			},
		}),
		prisma.account.create({
			data: {
				name: "Accounts Payable",
				code: "2000",
				type: "LIABILITY",
				tenantId: tenant.id,
			},
		}),
	]);

	// Create sample products
	await prisma.product.createMany({
		data: [
			{
				name: "Laptop",
				sku: "LAP-001",
				price: 1200,
				cost: 800,
				unitId: unitPcs.id,
				tenantId: tenant.id,
				stockLevel: 10,
			},
			{
				name: "Mouse",
				sku: "MOU-001",
				price: 25,
				cost: 15,
				unitId: unitPcs.id,
				tenantId: tenant.id,
				stockLevel: 50,
			},
		],
	});

	console.log({ tenant, admin, unitPcs, accountsCount: accounts.length });
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
