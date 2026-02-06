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
	const customerEmails = ["john@example.com", "jane@example.com"];
	for (const email of customerEmails) {
		await prisma.customer.upsert({
			where: { email },
			update: {},
			create: {
				name: email === "john@example.com" ? "John Doe" : "Jane Smith",
				email,
				tenantId: tenant.id,
			},
		});
	}

	// Create default units
	const unitPcs = await prisma.unit.upsert({
		where: { id: 1 }, // Assuming ID 1 for simplicity in seed
		update: {},
		create: {
			name: "Pcs",
			tenantId: tenant.id,
		},
	});

	// Create default accounts
	const defaultAccounts = [
		{ name: "Accounts Receivable", code: "1200", type: "ASSET" },
		{ name: "Sales Revenue", code: "4000", type: "REVENUE" },
		{ name: "Inventory", code: "1400", type: "ASSET" },
		{ name: "Cost of Goods Sold", code: "5000", type: "EXPENSE" },
		{ name: "Accounts Payable", code: "2000", type: "LIABILITY" },
	];

	const accounts = [];
	for (const acc of defaultAccounts) {
		const account = await prisma.account.upsert({
			where: { code: acc.code },
			update: {},
			create: {
				name: acc.name,
				code: acc.code,
				type: acc.type as any,
				tenantId: tenant.id,
			},
		});
		accounts.push(account);
	}

	// Create sample products
	const sampleProducts = [
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
	];

	for (const prod of sampleProducts) {
		await prisma.product.upsert({
			where: { sku_tenantId: { sku: prod.sku, tenantId: prod.tenantId } },
			update: {},
			create: {
				name: prod.name,
				sku: prod.sku,
				price: prod.price,
				cost: prod.cost,
				unitId: prod.unitId,
				tenantId: prod.tenantId,
				stockLevel: prod.stockLevel,
			},
		});
	}

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
