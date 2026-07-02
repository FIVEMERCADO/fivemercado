const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db, getUserByDiscordId } = require("../lib/supabase");
const { generateDownloadUrl } = require("../lib/hmac");

const COLOR = 0x2cade0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redimir")
    .setDescription("Canjea un código de descarga obtenido desde la web")
    .addStringOption((opt) =>
      opt
        .setName("codigo")
        .setDescription("Tu código de descarga (ej: AB3XY12Z90)")
        .setRequired(true)
        .setMinLength(6)
        .setMaxLength(20)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const codigo = interaction.options.getString("codigo", true).trim().toUpperCase();
    const supabase = db();

    // 1. Verificar usuario vinculado
    const user = await getUserByDiscordId(interaction.user.id);
    if (!user) {
      return interaction.editReply({
        content:
          "❌ Tu Discord no está vinculado a ninguna cuenta de FiveMercado.\n➡️ Inicia sesión en la web primero.",
      });
    }

    // 2. Buscar el código en DB
    const { data: redeemCode } = await supabase
      .from("redeem_codes")
      .select("id, used, user_id, script_id")
      .eq("code", codigo)
      .single();

    if (!redeemCode) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff4444)
            .setTitle("❌ Código inválido")
            .setDescription(
              `El código \`${codigo}\` no existe.\nComprueba que lo copiaste correctamente desde la web.`
            )
            .setFooter({ text: "FiveMercado" }),
        ],
      });
    }

    if (redeemCode.used) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff4444)
            .setTitle("❌ Código ya utilizado")
            .setDescription(
              "Este código ya fue canjeado anteriormente.\n\nGenera un nuevo código desde la web en **Mis Recursos → Obtener Código**."
            )
            .setFooter({ text: "FiveMercado" }),
        ],
      });
    }

    // 3. Verificar que el código pertenece a este usuario
    if (redeemCode.user_id !== user.id) {
      return interaction.editReply({
        content: "❌ Este código no pertenece a tu cuenta.",
      });
    }

    // 4. Obtener info del script
    const { data: script } = await supabase
      .from("scripts")
      .select("id, title")
      .eq("id", redeemCode.script_id)
      .single();

    if (!script) {
      return interaction.editReply({ content: "❌ Script no encontrado. Contacta con soporte." });
    }

    // 5. Generar URL de descarga firmada (HMAC + nonce en DB)
    const downloadUrl = await generateDownloadUrl(supabase, script.id, user.id);

    // 6. Marcar código como usado
    await supabase
      .from("redeem_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", redeemCode.id);

    // 7. Enviar link por DM
    const dmEmbed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`📦 ${script.title}`)
      .setDescription(
        `¡Código canjeado con éxito! Tu enlace de descarga está listo.\n\n[**⬇️ DESCARGAR AHORA**](${downloadUrl})\n\n> ⏰ Expira en **5 minutos**\n> 🔒 Enlace de **un solo uso** — no lo compartas`
      )
      .addFields(
        { name: "Código canjeado", value: `\`${codigo}\``, inline: true },
        { name: "Estado", value: "✅ Utilizado", inline: true }
      )
      .setFooter({ text: "FiveMercado • Solo para uso personal" })
      .setTimestamp();

    try {
      const dm = await interaction.user.createDM();
      await dm.send({ embeds: [dmEmbed] });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x22c55e)
            .setTitle("✅ Código canjeado")
            .setDescription(
              `Revisa tus DMs para el enlace de descarga de **${script.title}**.\n\n⏰ El enlace expira en **5 minutos**.`
            )
            .setFooter({ text: "FiveMercado" }),
        ],
      });
    } catch {
      // DMs cerrados
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xf59e0b)
            .setTitle("⚠️ DMs cerrados — Código canjeado")
            .setDescription(
              `No pudimos enviarte un DM. Tu enlace (solo tú puedes verlo):\n\n[**⬇️ DESCARGAR: ${script.title}**](${downloadUrl})\n\n⏰ Expira en **5 minutos**`
            )
            .setFooter({ text: "FiveMercado • Activa los DMs del servidor para mayor seguridad" }),
        ],
      });
    }
  },
};
