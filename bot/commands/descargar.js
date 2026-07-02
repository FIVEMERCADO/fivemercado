const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const { db, getUserByDiscordId } = require("../lib/supabase");
const { generateDownloadUrl } = require("../lib/hmac");

const COLOR = 0x2cade0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("descargar")
    .setDescription("Obtén el enlace de descarga de tus scripts comprados"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const supabase = db();
    const user = await getUserByDiscordId(interaction.user.id);

    if (!user) {
      return interaction.editReply({
        content:
          "❌ Tu cuenta de Discord no está vinculada a FiveMercado.\n➡️ Inicia sesión en la web primero.",
      });
    }

    // Obtener compras del usuario
    const { data: purchases } = await supabase
      .from("purchases")
      .select("script_id, scripts(id, title)")
      .eq("user_id", user.id)
      .limit(25);

    if (!purchases?.length) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setTitle("📭 Sin scripts comprados")
            .setDescription(
              "Aún no tienes ningún script comprado.\n\n➡️ Visita el marketplace para comprar recursos."
            )
            .setFooter({ text: "FiveMercado" }),
        ],
      });
    }

    // Construir select menu con los scripts comprados
    const select = new StringSelectMenuBuilder()
      .setCustomId("select_download")
      .setPlaceholder("Selecciona un script para descargar...")
      .addOptions(
        purchases.map((p) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(p.scripts.title.slice(0, 100))
            .setDescription("Click para obtener el enlace de descarga")
            .setValue(p.scripts.id)
            .setEmoji("📦")
        )
      );

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle("📥 Descargar Script")
      .setDescription(
        `Tienes **${purchases.length}** script${purchases.length !== 1 ? "s" : ""} disponible${purchases.length !== 1 ? "s" : ""}.\n\nSelecciona cuál quieres descargar:`
      )
      .setFooter({ text: "FiveMercado • El enlace expira en 5 minutos" });

    const reply = await interaction.editReply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    // Esperar selección (60 segundos)
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (selectInt) => {
      await selectInt.deferUpdate();

      const scriptId = selectInt.values[0];
      const script = purchases.find((p) => p.scripts.id === scriptId)?.scripts;

      // Generar URL firmada + nonce en DB
      const downloadUrl = await generateDownloadUrl(supabase, scriptId, user.id);

      const dmEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`📦 ${script.title}`)
        .setDescription(
          `Tu enlace de descarga está listo.\n\n[**⬇️ DESCARGAR AHORA**](${downloadUrl})\n\n> ⏰ Expira en **5 minutos**\n> 🔒 Enlace de **un solo uso** — no lo compartas`
        )
        .setFooter({ text: "FiveMercado • Solo para uso personal" })
        .setTimestamp();

      try {
        const dm = await interaction.user.createDM();
        await dm.send({ embeds: [dmEmbed] });

        await selectInt.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x22c55e)
              .setTitle("✅ Enlace enviado por DM")
              .setDescription(
                `Revisa tus mensajes directos para **${script.title}**.\n\n⏰ El enlace expira en **5 minutos**.`
              )
              .setFooter({ text: "FiveMercado" }),
          ],
          components: [],
        });
      } catch {
        // DMs cerrados — mostrar link solo aquí (es ephemeral, solo el usuario lo ve)
        await selectInt.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xf59e0b)
              .setTitle("⚠️ No podemos enviarte un DM")
              .setDescription(
                `Activa los DMs del servidor para recibir los enlaces de forma más segura.\n\nPor esta vez, tu enlace:\n\n[**⬇️ DESCARGAR: ${script.title}**](${downloadUrl})\n\n⏰ Expira en **5 minutos**`
              )
              .addFields({
                name: "Cómo activar DMs",
                value:
                  "Configuración → Privacidad > Mensajes directos del servidor → ON",
              })
              .setFooter({ text: "FiveMercado" }),
          ],
          components: [],
        });
      }

      collector.stop();
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction
          .editReply({
            content: "⏰ Tiempo agotado. Usa `/descargar` de nuevo.",
            embeds: [],
            components: [],
          })
          .catch(() => {});
      }
    });
  },
};
