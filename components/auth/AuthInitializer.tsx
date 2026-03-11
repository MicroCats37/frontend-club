"use client";

import { useEffect } from "react";
import type { LoggedUser } from "@/schemas/auth";
import { type AuthState, useAuthStore } from "@/store/useAuthStore";

interface AuthInitializerProps {
	user: LoggedUser | null;
}

export default function AuthInitializer({ user }: AuthInitializerProps) {
	const setUserInfo = useAuthStore((state: AuthState) => state.setUserInfo);

	useEffect(() => {
		if (user) {
			setUserInfo(user);
		}
	}, [user, setUserInfo]);

	return null;
}
