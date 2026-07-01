import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        const discordProfile = profile as {
          id: string;
          username: string;
          avatar: string | null;
          email: string;
          global_name?: string;
        };
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
          );
          const avatarUrl = discordProfile.avatar
            ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
            : null;
          await supabase.from("users").upsert(
            {
              discord_id: discordProfile.id,
              username: discordProfile.global_name || discordProfile.username,
              avatar: avatarUrl,
              email: discordProfile.email,
            },
            { onConflict: "discord_id" }
          );
        } catch (err) {
          console.error("DB upsert error:", err);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.discordId) {
        (session.user as typeof session.user & { discordId: string }).discordId =
          token.discordId as string;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile) {
        token.discordId = (profile as { id: string }).id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
});
