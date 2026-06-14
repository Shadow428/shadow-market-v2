/* ──────────────────────────────────────────────────────────
   auth.ts — LocalStorage-based auth with role support
   ────────────────────────────────────────────────────────── */

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  avatarColor: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

const USERS_KEY   = 'sm_users';
const SESSION_KEY = 'sm_session';

/* Simple hash (not cryptographic — for demo/localStorage use only) */
function hashPass(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const c = pass.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return String(Math.abs(hash));
}

/* Seed colors for avatars */
const AVATAR_COLORS = [
  '#7c3aed', '#9333ea', '#a855f7', '#c026d3',
  '#4f46e5', '#0891b2', '#059669', '#dc2626',
];
function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/* ── User store ─────────────────────────────────────────── */
function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];

    /* Seed a default admin if none exists */
    if (!users.find(u => u.role === 'admin')) {
      const admin: StoredUser = {
        id: 'admin_seed',
        username: 'Admin',
        email: 'admin@shadow.gg',
        role: 'admin',
        avatarColor: '#7c3aed',
        passwordHash: hashPass('admin123'),
      };
      users.push(admin);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ── Auth API ────────────────────────────────────────────── */
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export function signup(username: string, email: string, password: string): AuthResult {
  if (!username.trim() || !email.trim() || !password)
    return { success: false, error: 'All fields are required.' };
  if (password.length < 6)
    return { success: false, error: 'Password must be at least 6 characters.' };

  const users = getStoredUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { success: false, error: 'An account with this email already exists.' };

  const newUser: StoredUser = {
    id: `u_${Date.now()}`,
    username: username.trim(),
    email: email.toLowerCase().trim(),
    role: 'user',
    avatarColor: randomColor(),
    passwordHash: hashPass(password),
  };
  users.push(newUser);
  saveUsers(users);

  const { passwordHash: _, ...user } = newUser;
  return { success: true, user };
}

export function login(email: string, password: string): AuthResult {
  const users = getStoredUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!found)
    return { success: false, error: 'No account found with that email.' };
  if (found.passwordHash !== hashPass(password))
    return { success: false, error: 'Incorrect password.' };

  const { passwordHash: _, ...user } = found;
  saveSession(user);
  return { success: true, user };
}

/* ── Session ─────────────────────────────────────────────── */
export function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
