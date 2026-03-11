import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
	headers: {
		"Content-Type": "application/json",
	},
});

// Request Interceptor - Leer token directamente de la cookie
api.interceptors.request.use(
	(config) => {
		// cookies-next detecta automáticamente si estamos en cliente o servidor (si se pasa el context)
		// En llamadas de cliente, simplemente lee la cookie.
		const accessToken = getCookie("jwt-access");

		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}

		if (config.data instanceof FormData) {
			delete config.headers["Content-Type"];
		}

		return config;
	},
	(error) => Promise.reject(error),
);

// Response Interceptor - Refresh token automático usando cookies
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			const refreshToken = getCookie("jwt-refresh");

			if (!refreshToken) {
				handleGlobalLogout();
				return Promise.reject(error);
			}

			try {
				const { data } = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/refresh/`,
					{ refresh: refreshToken },
				);

				// Guardar nuevo access token en cookie
				setCookie("jwt-access", data.access, {
					maxAge: 60 * 15,
					path: "/",
					sameSite: "lax",
				});

				originalRequest.headers.Authorization = `Bearer ${data.access}`;
				return api(originalRequest);
			} catch (refreshError) {
				handleGlobalLogout();
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);

/**
 * Limpieza centralizada cuando la sesión expira
 */
function handleGlobalLogout() {
	deleteCookie("jwt-access");
	deleteCookie("jwt-refresh");
	deleteCookie("user-session");
	useAuthStore.getState().logout();

	if (typeof window !== "undefined") {
		window.location.href = "/login";
	}
}

export default api;
