import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 /* 8 h */ },
  pages: { signIn: '/admin' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
        const plain = process.env.ADMIN_PASSWORD;

        // Sin configuración no se autoriza a nadie (evita bypass por env vacío).
        if (!adminEmail || (!hash && !plain)) return null;

        const emailOk = credentials.email.trim().toLowerCase() === adminEmail.toLowerCase();
        if (!emailOk) return null;

        // Preferimos hash bcrypt; texto plano sólo como fallback de conveniencia.
        const passOk = hash
          ? await bcrypt.compare(credentials.password, hash)
          : credentials.password === plain;

        if (!passOk) return null;
        return { id: '1', email: adminEmail, name: 'Admin' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = 'admin';
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
};
