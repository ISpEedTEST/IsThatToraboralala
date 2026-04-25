import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // هذه الدالة تأخذ الآيدي الخاص بديسكورد (token.sub) وتلصقه في الجلسة (session)
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub; 
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

// Next.js (App Router) يتطلب تصدير GET و POST
export { handler as GET, handler as POST };