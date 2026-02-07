import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
	await prisma.user.upsert({
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

	// Create default units
	const unitPcs = await prisma.unit.upsert({
		where: {
			tenantId_name: {
				tenantId: tenant.id,
				name: "Pcs",
			},
		},
		update: {},
		create: {
			name: "Pcs",
			tenantId: tenant.id,
		},
	});

	// Create default accounts
	const defaultAccounts = [
		{ name: "Accounts Receivable", code: "1200", type: "ASSET" as const },
		{ name: "Sales Revenue", code: "4000", type: "REVENUE" as const },
		{ name: "Inventory", code: "1400", type: "ASSET" as const },
		{ name: "Cost of Goods Sold", code: "5000", type: "EXPENSE" as const },
		{ name: "Accounts Payable", code: "2000", type: "LIABILITY" as const },
	];

	for (const acc of defaultAccounts) {
		await prisma.account.upsert({
			where: {
				tenantId_code: {
					tenantId: tenant.id,
					code: acc.code,
				},
			},
			update: {},
			create: {
				name: acc.name,
				code: acc.code,
				type: acc.type,
				tenantId: tenant.id,
			},
		});
	}

	// Create some sample customers
	const customers = [
		{ name: "John Doe", email: "john@example.com" },
		{ name: "Jane Smith", email: "jane@example.com" },
	];

	for (const customer of customers) {
		await prisma.customer.upsert({
			where: {
				tenantId_email: {
					tenantId: tenant.id,
					email: customer.email,
				},
			},
			update: {},
			create: {
				name: customer.name,
				email: customer.email,
				tenantId: tenant.id,
			},
		});
	}

	// Create sample products
	const sampleProducts = [
		{
			name: "Laptop",
			sku: "LAP-001",
			price: new Prisma.Decimal(1200),
			cost: new Prisma.Decimal(800),
			unitId: unitPcs.id,
			tenantId: tenant.id,
			stockLevel: new Prisma.Decimal(10),
		},
		{
			name: "Mouse",
			sku: "MOU-001",
			price: new Prisma.Decimal(25),
			cost: new Prisma.Decimal(15),
			unitId: unitPcs.id,
			tenantId: tenant.id,
			stockLevel: new Prisma.Decimal(50),
		},
	];

	for (const product of sampleProducts) {
		await prisma.product.upsert({
			where: {
				tenantId_sku: {
					tenantId: tenant.id,
					sku: product.sku,
				},
			},
			update: {},
			create: product,
		});
	}

	console.log("✅ Seed completed successfully");
}

main()
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
