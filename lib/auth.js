import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { ensureDatabaseSeeded } from './auto-seed';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'doctor@ayushcase.in' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        // Ensure database tables and doctor exist on serverless cold start
        await ensureDatabaseSeeded(prisma);

        const email = credentials.email.toLowerCase().trim();
        const doctor = await prisma.doctor.findUnique({
          where: { email },
        });

        if (!doctor) {
          throw new Error('No doctor account found with this email');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, doctor.password);

        if (!isPasswordValid) {
          throw new Error('Incorrect password');
        }

        return {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          regNumber: doctor.regNumber,
          clinicName: doctor.clinicName,
          specialty: doctor.specialty,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.regNumber = user.regNumber;
        token.clinicName = user.clinicName;
        token.specialty = user.specialty;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.regNumber = token.regNumber;
        session.user.clinicName = token.clinicName;
        session.user.specialty = token.specialty;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/signup',
  },
  secret: process.env.NEXTAUTH_SECRET || 'ayushcase-sih-2026-secret-key-super-secure-hash',
};
