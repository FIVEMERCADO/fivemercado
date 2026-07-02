/**
 * Setup automático del servidor Discord de FiveMercado.
 * Ejecutar UNA SOLA VEZ después de invitar el bot al servidor:
 *   node bot/setup-server.js <GUILD_ID>
 */

const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require("discord.js");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const GUILD_ID = process.argv[2];
if (!GUILD_ID) {
  console.error("❌ Uso: node setup-server.js <GUILD_ID>");
  console.error("   El Guild ID está en Discord: click derecho en el servidor → Copiar ID");
  process.exit(1);
}

// ─── Estructura del servidor ──────────────────────────────────────────────────

const ROLES = [
  { name: "👑 Admin",       color: 0xe74c3c, hoist: true, permissions: [PermissionFlagsBits.Administrator] },
  { name: "🛠️ Staff",       color: 0xe67e22, hoist: true, permissions: [] },
  { name: "💎 VIP",         color: 0x2cade0, hoist: true, permissions: [] },
  { name: "🌟 Vendedor",    color: 0x9b59b6, hoist: true, permissions: [] },
  { name: "🛒 Comprador",   color: 0x2ecc71, hoist: true, permissions: [] },
  { name: "👤 Miembro",     color: 0x95a5a6, hoist: false, permissions: [] },
];

const CHANNELS = [
  // ── INFO ─────────────────────────────────────────────────────
  {
    category: "📋 INFORMACIÓN",
    channels: [
      { name: "👋│bienvenida",  type: ChannelType.GuildText, topic: "Bienvenido a FiveMercado — el marketplace FiveM en español" },
      { name: "📜│reglas",      type: ChannelType.GuildText, topic: "Lee las reglas antes de participar" },
      { name: "📢│anuncios",    type: ChannelType.GuildAnnouncement, topic: "Actualizaciones y novedades oficiales" },
      { name: "🆕│nuevos-scripts", type: ChannelType.GuildAnnouncement, topic: "Scripts recién publicados en el marketplace" },
    ],
  },
  // ── MARKETPLACE ──────────────────────────────────────────────
  {
    category: "🛒 MARKETPLACE",
    channels: [
      { name: "⭐│destacados",  type: ChannelType.GuildText, topic: "Scripts más populares y valorados" },
      { name: "💸│ofertas",     type: ChannelType.GuildText, topic: "Descuentos y scripts gratuitos" },
      { name: "🔍│busco-script",type: ChannelType.GuildText, topic: "Pide el script que necesitas" },
    ],
  },
  // ── COMUNIDAD ────────────────────────────────────────────────
  {
    category: "💬 COMUNIDAD",
    channels: [
      { name: "💬│general",     type: ChannelType.GuildText, topic: "Chat general de la comunidad" },
      { name: "🎮│servidores",  type: ChannelType.GuildText, topic: "Comparte y promociona tu servidor FiveM" },
      { name: "💡│sugerencias", type: ChannelType.GuildText, topic: "Ideas para mejorar FiveMercado" },
      { name: "🖼️│showcase",   type: ChannelType.GuildText, topic: "Muestra tu servidor con los scripts comprados" },
    ],
  },
  // ── SOPORTE ──────────────────────────────────────────────────
  {
    category: "🎧 SOPORTE",
    channels: [
      { name: "❓│faq",         type: ChannelType.GuildText, topic: "Preguntas frecuentes" },
      { name: "🆘│soporte",     type: ChannelType.GuildForum, topic: "Abre un ticket si tienes problemas con tu compra" },
    ],
  },
  // ── BOT ──────────────────────────────────────────────────────
  {
    category: "🤖 BOT",
    channels: [
      { name: "🤖│comandos",    type: ChannelType.GuildText, topic: "Usa aquí los comandos: /descargar /saldo /miscompras" },
    ],
  },
  // ── STAFF (privado) ──────────────────────────────────────────
  {
    category: "🔒 STAFF",
    channels: [
      { name: "💼│staff-chat",  type: ChannelType.GuildText, topic: "Canal privado de staff" },
      { name: "📊│logs-ventas", type: ChannelType.GuildText, topic: "Log automático de compras" },
      { name: "🚨│reportes",    type: ChannelType.GuildText, topic: "Reportes de usuarios" },
    ],
    staffOnly: true,
  },
];

// ─── Script de setup ─────────────────────────────────────────────────────────

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
  console.log(`\n✅ Bot conectado como ${client.user.tag}`);
  console.log(`🏗️  Configurando servidor: ${GUILD_ID}\n`);

  const guild = await client.guilds.fetch(GUILD_ID);
  if (!guild) {
    console.error("❌ No se encontró el servidor. Verifica el GUILD_ID y que el bot esté en el servidor.");
    process.exit(1);
  }

  console.log(`📌 Servidor: ${guild.name}`);

  // 1. Crear roles
  console.log("\n👥 Creando roles...");
  const createdRoles = {};
  for (const role of ROLES) {
    try {
      const existing = guild.roles.cache.find((r) => r.name === role.name);
      if (existing) {
        console.log(`   ⏭️  Ya existe: ${role.name}`);
        createdRoles[role.name] = existing;
        continue;
      }
      const created = await guild.roles.create({
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        permissions: role.permissions,
        reason: "FiveMercado setup automático",
      });
      createdRoles[role.name] = created;
      console.log(`   ✓ ${role.name}`);
    } catch (err) {
      console.error(`   ❌ Error creando rol ${role.name}:`, err.message);
    }
  }

  const staffRole  = createdRoles["🛠️ Staff"];
  const everyoneRole = guild.roles.everyone;

  // 2. Crear categorías y canales
  console.log("\n📁 Creando categorías y canales...");
  for (const cat of CHANNELS) {
    try {
      // Crear categoría
      let category = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildCategory && c.name === cat.category
      );
      if (!category) {
        const permOverwrites = cat.staffOnly
          ? [
              { id: everyoneRole.id, deny: [PermissionFlagsBits.ViewChannel] },
              ...(staffRole ? [{ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel] }] : []),
            ]
          : [];

        category = await guild.channels.create({
          name: cat.category,
          type: ChannelType.GuildCategory,
          permissionOverwrites: permOverwrites,
          reason: "FiveMercado setup",
        });
        console.log(`\n   📁 ${cat.category}`);
      }

      // Crear canales dentro de la categoría
      for (const ch of cat.channels) {
        const existing = guild.channels.cache.find((c) => c.name === ch.name && c.parentId === category.id);
        if (existing) {
          console.log(`      ⏭️  Ya existe: ${ch.name}`);
          continue;
        }
        await guild.channels.create({
          name: ch.name,
          type: ch.type,
          parent: category.id,
          topic: ch.topic ?? "",
          reason: "FiveMercado setup",
        });
        console.log(`      ✓ ${ch.name}`);
        // Pequeña pausa para evitar rate limit de Discord
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (err) {
      console.error(`   ❌ Error en categoría ${cat.category}:`, err.message);
    }
  }

  console.log("\n✅ ¡Servidor configurado con éxito!");
  console.log("\n📋 Próximos pasos:");
  console.log("   1. Asigna el rol '👑 Admin' a ti mismo manualmente");
  console.log("   2. Personaliza el mensaje de bienvenida en #bienvenida");
  console.log("   3. Escribe las reglas en #reglas");
  console.log("   4. Usa pm2 start ecosystem.config.js para arrancar el bot");
  console.log("   5. Usa node deploy.js para registrar los comandos slash");

  await client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_BOT_TOKEN);
