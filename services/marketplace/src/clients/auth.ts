import { callService } from "@leetconnect/shared";

const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://auth:3001";

export interface AuthUserSummary {
  id:         string;
  username:   string;
  avatar:     string | null;
  firstname:  string | null;
  lastname:   string | null;
}

export async function fetchUserFromAuth(
  userId:     string,
  authHeader?: string
): Promise<AuthUserSummary | null> {
  try {
    const { user } = await callService<{ user: AuthUserSummary }>(
      AUTH_URL,
      `/api/auth/users/${userId}`,
      authHeader ? { headers: { Authorization: authHeader } } : {}
    );
    return user;
  } catch (err) {
    console.error(`fetchUserFromAuth(${userId}) failed:`, err);
    return null;
  }
}
