import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isGuildMember } from "@/lib/discord-guild";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const discordId = (session.user as { discordId?: string }).discordId;
  if (!discordId) {
    return NextResponse.json({ member: false });
  }

  const member = await isGuildMember(discordId);
  return NextResponse.json({ member });
}
