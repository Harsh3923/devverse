import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.githubLogin = profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      session.githubLogin = token.githubLogin;
      return session;
    },
  },
};
