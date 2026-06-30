const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

// ─── Config ──────────────────────────────────────────────────
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!TOKEN || !CLIENT_ID || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing env vars. Check .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Register slash commands ──────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem a one-time download code for a purchased FiveM script")
    .addStringOption((opt) =>
      opt.setName("code").setDescription("Your download code (e.g. 964139AFCF)").setRequired(true)
    ),
].map((c) => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("📡 Registering slash commands...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("✅ Slash commands registered.");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
})();

// ─── Bot client ───────────────────────────────────────────────
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "redeem") return;

  const code = interaction.options.getString("code", true).trim().toUpperCase();
  const discordId = interaction.user.id;

  await interaction.deferReply({ ephemeral: true });

  try {
    // 1. Resolve user in DB by discord_id
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id, username")
      .eq("discord_id", discordId)
      .single();

    if (userErr || !user) {
      return interaction.editReply({
        content: "❌ Your Discord account is not linked to any marketplace account. Please log in at the website first.",
      });
    }

    // 2. Look up the code
    const { data: redeemCode, error: codeErr } = await supabase
      .from("redeem_codes")
      .select("id, used, user_id, script_id")
      .eq("code", code)
      .single();

    if (codeErr || !redeemCode) {
      return interaction.editReply({ content: "❌ Invalid code. Please check and try again." });
    }

    if (redeemCode.used) {
      return interaction.editReply({
        content: "❌ This code has already been used. Generate a new code from your profile page.",
      });
    }

    // 3. Verify ownership
    if (redeemCode.user_id !== user.id) {
      return interaction.editReply({ content: "❌ This code does not belong to your account." });
    }

    // 4. Get the script info
    const { data: script } = await supabase
      .from("scripts")
      .select("id, title, files, external_links, file_option")
      .eq("id", redeemCode.script_id)
      .single();

    if (!script) {
      return interaction.editReply({ content: "❌ Script not found. Please contact support." });
    }

    // 5. Build download info
    let downloadInfo = "";
    if (script.file_option === "links" && script.external_links?.length > 0) {
      downloadInfo = script.external_links
        .map((link, i) => `[Download Link ${i + 1}](${link})`)
        .join("\n");
    } else if (script.files?.length > 0) {
      const baseUrl = process.env.SITE_URL || "https://your-site.vercel.app";
      downloadInfo = script.files
        .map((f, i) => `[${f}](${baseUrl}/api/download/${script.id}/${encodeURIComponent(f)}?code=${code})`)
        .join("\n");
    } else {
      downloadInfo = "Contact support — no files attached to this script.";
    }

    // 6. Mark code as used
    await supabase
      .from("redeem_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", redeemCode.id);

    // 7. Try to DM the user
    try {
      const dmChannel = await interaction.user.createDM();
      const embed = new EmbedBuilder()
        .setColor(0x2cade0)
        .setTitle(`🎮 Download: ${script.title}`)
        .setDescription(
          `Your purchase has been verified! Here are your download links:\n\n${downloadInfo}`
        )
        .addFields(
          { name: "Code Used", value: `\`${code}\``, inline: true },
          { name: "Status", value: "✅ Redeemed", inline: true }
        )
        .setFooter({ text: "ScriptVault Marketplace • This link is for your use only." })
        .setTimestamp();

      await dmChannel.send({ embeds: [embed] });
    } catch {
      return interaction.editReply({
        content:
          "⚠️ Could not send you a DM. Please enable DMs from server members and try again. Your code has NOT been consumed.",
      });
    }

    // 8. Public reply
    await interaction.editReply({
      content: `✅ **Code redeemed!** Check your DMs for the download link to **${script.title}**.`,
    });
  } catch (err) {
    console.error("Redeem error:", err);
    await interaction.editReply({ content: "❌ An internal error occurred. Please try again later." });
  }
});

client.login(TOKEN);
