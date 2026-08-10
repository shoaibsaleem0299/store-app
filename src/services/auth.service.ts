import { getCookie, deleteCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async signIn(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async signOut() {
    deleteCookie("token");
    window.location.href = "/login";
  },

  async getCurrentUser() {
    const token = getCookie("token") as string;
    console.log("getCurrentUser: token from cookie:", token);
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      console.log("getCurrentUser: decoded JWT:", decoded);
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        fullName: decoded.fullName,
      };
    } catch (err) {
      console.error("getCurrentUser: jwtDecode error:", err);
      return null;
    }
  },

  async getSession() {
    const user = await this.getCurrentUser();
    return user ? { user } : null;
  },
};
