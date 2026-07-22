export type LocalUser = {
  id: string;
  displayName: string;
};

const USER_KEY = "deathMahjongUser";

export function saveUser(user: LocalUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): LocalUser | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(USER_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as LocalUser;
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}