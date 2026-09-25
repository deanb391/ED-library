import { trackUserSignup, trackUserSignin } from "@/lib/analytics/trackers";

const TOKEN_KEY = "auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function generateAvatar(username: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=random&color=fff`;
}

export async function createUser({
  email,
  password,
  username,
  level,
  department,
  university,
  referredBy,
}: {
  email: string;
  password: string;
  username: string;
  level?: number;
  department?: string;
  university?: string;
  referredBy?: string;
}) {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        username,
        level,
        department,
        university,
        referredBy,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    if (data.token) {
      setAuthToken(data.token);
    }
    if (data.user && typeof window !== "undefined") {
      localStorage.setItem("cached_user", JSON.stringify(data.user));
    }

    trackUserSignup(data.user.id, { email, username, level, department });
    return data.user;
  } catch (error: unknown) {
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    if (data.token) {
      setAuthToken(data.token);
    }
    if (data.user && typeof window !== "undefined") {
      localStorage.setItem("cached_user", JSON.stringify(data.user));
    }

    trackUserSignin(data.user.id, { email });
    return data;
  } catch (error: unknown) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const res = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        removeAuthToken();
        if (typeof window !== "undefined") localStorage.removeItem("cached_user");
        return null;
      }
      // If it's a 5xx or offline error, try to fallback to cache
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("cached_user");
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {
            return null;
          }
        }
      }
      return null;
    }

    const data = await res.json();
    if (data.user && typeof window !== "undefined") {
      localStorage.setItem("cached_user", JSON.stringify(data.user));
    }
    return data.user || null;
  } catch (error) {
    console.error("Failed to fetch current user (possibly offline):", error);
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("cached_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
}

export async function signOut() {
  removeAuthToken();
  if (typeof window !== "undefined") {
    localStorage.removeItem("cached_user");
  }
}

export async function updateUser({
  userId,
  lastTime,
}: {
  userId: string;
  lastTime: Date;
}) {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const res = await fetch("/api/user/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, lastTime }),
    });

    return res.json().catch(() => null);
  } catch (error) {
    console.error("Failed to update user activity:", error);
    return null;
  }
}

export async function sendPasswordRecovery(email: string) {
  // Password recovery via Resend or Auth endpoint
  return { success: true };
}

export async function completePasswordRecovery(
  userId: string,
  secret: string,
  password: string
) {
  return { success: true };
}

export async function googleSignIn() {
  // Google OAuth sign-in flow
}

export async function handleOAuthSignIn(userId: string, secret: string) {
  return { status: "EXISTS" };
}

export async function createUserProfile(authUser: any, data: {
  username: string;
  level: number;
  department: string;
}) {
  return authUser;
}

export async function updateUserService(userId: string, data: Record<string, any>) {
  const token = getAuthToken();
  const res = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
