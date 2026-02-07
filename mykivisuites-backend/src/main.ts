import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();

	const port = process.env.PORT || 3000;
	console.log(`Starting NestJS on port: ${port}...`);
	console.log(`Binding to host: 0.0.0.0`);
	await app.listen(port, "0.0.0.0");
	console.log(`Application is successfully listening on port ${port}`);
}
bootstrap().catch((err) => {
	console.error("Failed to start application:", err);
	process.exit(1);
});
