import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const hashedPassword = await bcrypt.hash("admin123", 10);

	// Create default tenant
	const tenant = await (prisma as any).tenant.upsert({
		where: { subdomain: "admin" },
		update: {},
		create: {
			name: "Kivisuites Admin",
			subdomain: "admin",
		},
	});

	// Create admin user
	await (prisma as any).user.upsert({
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
		await (prisma as any).customer.upsert({
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
	const unitPcs = await (prisma as any).unit.upsert({
		where: { id: 1 }, // Assuming ID 1 for simplicity in seed
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
		await (prisma as any).account.upsert({
			where: { code: acc.code },
			update: {},
			create: {
				name: acc.name,
				code: acc.code,
				type: acc.type,
				tenantId: tenant.id,
			},
		});
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

	for (const product of sampleProducts) {
		await (prisma as any).product.upsert({
			where: { sku: product.sku },
			update: {},
			create: product,
		});
	}

	console.log("Seed completed successfully");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
