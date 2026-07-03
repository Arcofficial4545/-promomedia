import "server-only";
import { verifyPassword } from "@/lib/auth/password";
import { getAdminUserByEmail, getAdminUserById } from "@/lib/db/repositories/adminUsers";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
};

/**
 * Auth adapter interface. Local credentials (admin_users table + scrypt)
 * today; a Supabase Auth implementation can replace `localAuthAdapter`
 * without touching feature code — see DATA_LAYER.md.
 */
export type AuthAdapter = {
  verifyCredentials(email: string, password: string): Promise<AuthUser | null>;
  getUserById(id: string): Promise<AuthUser | null>;
};

const localAuthAdapter: AuthAdapter = {
  async verifyCredentials(email, password) {
    const user = await getAdminUserByEmail(email);
    if (!user) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },

  async getUserById(id) {
    const user = await getAdminUserById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },
};

export const auth: AuthAdapter = localAuthAdapter;
