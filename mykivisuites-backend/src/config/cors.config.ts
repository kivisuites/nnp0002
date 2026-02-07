// CORS configuration
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

const allowedOrigins = [
	"https://mykivisuites-production.up.railway.app",
	"https://mykivisuites.com",
	"http://localhost:5173",
	"http://localhost:3001",
	"http://localhost:3000",
];

export const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		// allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		if (
			allowedOrigins.indexOf(origin) !== -1 ||
			origin.endsWith(".railway.app")
		) {
			callback(null, true);
		} else {
			console.warn(`CORS blocked for origin: ${origin}`);
			callback(new Error("Not allowed by CORS"), false);
		}
	},
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
	credentials: true,
	preflightContinue: false,
	optionsSuccessStatus: 204,
};
