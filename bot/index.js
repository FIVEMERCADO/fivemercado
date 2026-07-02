const { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder } = require("discord.js");
const fs   = require("fs");
const path = require("path");

// Cargar .env.local del proyecto raíz
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// ─── Validación de env vars ───────────────────────────────────────────────────
const REQUIRED = [
  "DISCORD_BOT_TOKEN",
  "DISCORD_CLIENT_ID",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "DOWNLOAD_SECRET",
  "SITE_URL",
];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("❌ Faltan variables de entorno:", missing.join(", "));
  process.exit(1);
}

// ─── Cargar comandos ─────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"))) {
  const command = require(path.join(commandsPath, file));
  if (!command.data || !command.execute) {
    console.warn(`⚠️  Comando inválido: ${file}`);
    continue;
  }
  client.commands.set(command.data.name, command);
  console.log(`  ✓ /${command.data.name}`);
}

// ─── Eventos ─────────────────────────────────────────────────────────────────
client.once("ready", () => {
  console.log(`\n✅ Bot online: ${client.user.tag}`);
  client.user.setActivity("fivemercado.vercel.app", { type: ActivityType.Watching });
});

client.on("guildMemberAdd", async (member) => {
  try {
    const embed = new EmbedBuilder()
      .setColor(0x2cade0)
      .setTitle("👋 ¡Bienvenido a FiveMercado!")
      .setDescription(
        `Hola **${member.user.username}**, bienvenido al marketplace de scripts FiveM en español.\n\n` +
        `Aquí puedes comprar, descargar y gestionar scripts premium para tu servidor FiveM.`
      )
      .addFields(
        {
          name: "🚀 Primeros pasos",
          value: [
            "1️⃣ Visita **fivemercado.vercel.app** e inicia sesión con Discord",
            "2️⃣ Explora el marketplace y compra scripts",
            "3️⃣ Usa `/descargar` en este servidor para obtener tus archivos",
          ].join("\n"),
        },
        {
          name: "🤖 Comandos útiles",
          value: [
            "`/descargar` — Descarga tus scripts comprados",
            "`/saldo` — Ver tus créditos disponibles",
            "`/miscompras` — Ver todos tus recursos",
            "`/ayuda` — Ver todos los comandos",
          ].join("\n"),
        },
        {
          name: "🔗 Links",
          value: [
            "🌐 [Marketplace](https://fivemercado.vercel.app/marketplace)",
            "💳 [Comprar créditos](https://fivemercado.vercel.app/credits)",
            "❓ [Soporte](https://fivemercado.vercel.app/support)",
          ].join("  •  "),
        }
      )
      .setThumbnail("https://fivemercado.vercel.app/logo.png")
      .setFooter({ text: "FiveMercado • El marketplace FiveM en español" })
      .setTimestamp();

    await member.send({ embeds: [embed] });
  } catch {
    // El usuario tiene los DMs desactivados — silencioso
  }

  // Asignar rol Miembro automáticamente
  try {
    const memberRole = member.guild.roles.cache.find((r) => r.name === "👤 Miembro");
    if (memberRole) await member.roles.add(memberRole);
  } catch {
    // Sin permisos de manage roles — silencioso
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ /${interaction.commandName}:`, err);
    const msg = { content: "❌ Error inesperado. Inténtalo más tarde.", ephemeral: true };
    if (interaction.deferred || interaction.replied) await interaction.editReply(msg).catch(() => {});
    else await interaction.reply(msg).catch(() => {});
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
