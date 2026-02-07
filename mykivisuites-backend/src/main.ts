import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { corsOptions } from "./config/cors.config";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Trust proxy - essential for Railway/behind reverse proxies
	app.set("trust proxy", 1);

	// Enable validation globally
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	);

	// CORS Configuration
	app.enableCors(corsOptions);

	// Use the port provided by Railway (or fallback to 3000)
	const port = Number(process.env.PORT) || 3000;
	const host = process.env.APP_HOST || "0.0.0.0";

	console.log("--- NestJS Startup Information ---");
	console.log(`Port: ${port}`);
	console.log(`Host: ${host}`);
	console.log(`Frontend URL: ${process.env.FRONTEND_URL || "Not Set"}`);
	console.log(`Database URL Set: ${!!process.env.DATABASE_URL}`);
	console.log("----------------------------------");

	await app.listen(port, host);

	console.log(
		`Application is successfully listening on http://${host}:${port}`,
	);
}

bootstrap().catch((err) => {
	console.error("Failed to start application:", err);
	process.exit(1);
});
