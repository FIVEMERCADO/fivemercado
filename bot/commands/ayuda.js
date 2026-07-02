const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const COLOR = 0x2cade0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ayuda")
    .setDescription("Ver todos los comandos disponibles del bot de FiveMercado"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle("📖 Comandos de FiveMercado")
      .setDescription(
        "Bienvenido al bot oficial de **FiveMercado** — el marketplace de scripts FiveM en español.\n\nPrimero necesitas iniciar sesión con Discord en la web para vincular tu cuenta."
      )
      .addFields(
        {
          name: "📥 `/descargar`",
          value:
            "Muestra tus scripts comprados y genera un enlace de descarga seguro.\n→ El enlace expira en **5 minutos** y es de **un solo uso**.",
          inline: false,
        },
        {
          name: "🎟️ `/redimir [código]`",
          value:
            "Canjea un código de descarga obtenido desde la web.\n→ Ve a tu perfil → Mis Recursos → Obtener Código.",
          inline: false,
        },
        {
          name: "🛒 `/miscompras`",
          value: "Lista todos los scripts que has comprado con fecha y precio.",
          inline: false,
        },
        {
          name: "🪙 `/saldo`",
          value: "Muestra tu saldo de créditos y las últimas transacciones.",
          inline: false,
        },
        {
          name: "❓ `/ayuda`",
          value: "Muestra este mensaje.",
          inline: false,
        }
      )
      .addFields({
        name: "🔗 Links útiles",
        value: [
          "🌐 **Marketplace**: fivemercado.vercel.app/marketplace",
          "💳 **Comprar créditos**: fivemercado.vercel.app/credits",
          "👤 **Mi perfil**: fivemercado.vercel.app/profile",
        ].join("\n"),
      })
      .setFooter({ text: "FiveMercado • El marketplace FiveM en español" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
