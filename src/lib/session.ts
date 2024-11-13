import jwt from "jsonwebtoken";

const secretKey = "45ads4ds8we343ss";

export interface SessionData {
	userId: string;
	email: string;
	role: string;
}

export function createSession(data: SessionData): string {
	return jwt.sign(data, secretKey, { expiresIn: "1h" });
}

export function verifySession(token: string): SessionData | null {
	try {
		return jwt.verify(token, secretKey, {}) as SessionData;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error: any) {
		return null;
	}
}
