import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [credentials.email]
          ) as [Array<{id: number; name: string; email: string; password: string; role: string}>, unknown];

          if (rows.length === 0) return null;
          const user = rows[0];

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return { id: String(user.id), name: user.name, email: user.email, role: user.role };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as {role?: string}).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as {role?: unknown}).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
