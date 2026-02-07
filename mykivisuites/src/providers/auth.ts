import { AuthProvider } from "@refinedev/core";
import { API_URL } from "./constants";

export const authProvider: AuthProvider = {
	login: async ({ email, password }) => {
		try {
			const response = await fetch(`${API_URL}/auth/login`, {
				method: "POST",
				body: JSON.stringify({ email, password }),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				return {
					success: false,
					error: {
						name: "LoginError",
						message: data.message || "Invalid email or password",
					},
				};
			}

			const data = await response.json();
			localStorage.setItem("kivi-auth", JSON.stringify(data));
			return {
				success: true,
				redirectTo: "/",
			};
		} catch (error) {
			console.error("Login fetch error:", error);
			return {
				success: false,
				error: {
					name: "NetworkError",
					message:
						"Failed to connect to the server. Please check your internet connection or try again later.",
				},
			};
		}
	},
	logout: async () => {
		localStorage.removeItem("kivi-auth");
		return {
			success: true,
			redirectTo: "/login",
		};
	},
	check: async () => {
		const auth = localStorage.getItem("kivi-auth");
		if (auth) {
			return {
				authenticated: true,
			};
		}

		return {
			authenticated: false,
			logout: true,
			redirectTo: "/login",
		};
	},
	getPermissions: async () => {
		const auth = localStorage.getItem("kivi-auth");
		if (auth) {
			const { user } = JSON.parse(auth);
			return user.role;
		}
		return null;
	},
	getIdentity: async () => {
		const auth = localStorage.getItem("kivi-auth");
		if (auth) {
			const { user } = JSON.parse(auth);
			return user;
		}
		return null;
	},
	onError: async (error) => {
		console.error(error);
		return { error };
	},
};
