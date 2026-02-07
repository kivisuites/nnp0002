import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey:
				process.env.JWT_SECRET ||
				"your-super-secret-jwt-key-change-in-production",
		});
	}

	validate(payload: {
		sub: string;
		email: string;
		tenantId: string;
		role: string;
	}) {
		return {
			userId: payload.sub,
			email: payload.email,
			tenantId: payload.tenantId,
			role: payload.role,
		};
	}
}
