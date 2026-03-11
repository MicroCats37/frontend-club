import { z } from "zod";

export const TokenRefreshRequestSchema = z.object({
	refresh: z.string(),
});

export const TokenRefreshResponseSchema = z.object({
	access: z.string(),
});

export type TokenRefreshRequest = z.infer<typeof TokenRefreshRequestSchema>;
export type TokenRefreshResponse = z.infer<typeof TokenRefreshResponseSchema>;
