import { AuthProvider } from "@refinedev/core";
import { API_URL } from "./constants";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200 || response.status === 201) {
      localStorage.setItem("kivi-auth", JSON.stringify(data));
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: data.message || "Invalid email or password",
      },
    };
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
