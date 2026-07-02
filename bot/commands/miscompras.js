const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db, getUserByDiscordId } = require("../lib/supabase");

const COLOR = 0x2cade0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("miscompras")
    .setDescription("Ver todos los scripts que has comprado en FiveMercado"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const supabase = db();
    const user = await getUserByDiscordId(interaction.user.id);

    if (!user) {
      return interaction.editReply({
        content:
          "❌ Tu Discord no está vinculado a FiveMercado.\n➡️ Inicia sesión en la web primero.",
      });
    }

    const { data: purchases } = await supabase
      .from("purchases")
      .select("price_paid, purchased_at, scripts(title, category_id, categories(name))")
      .eq("user_id", user.id)
      .order("purchased_at", { ascending: false })
      .limit(20);

    if (!purchases?.length) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setTitle("📭 Sin compras todavía")
            .setDescription(
              "Aún no tienes ningún script comprado.\n\n➡️ Visita el marketplace para comprar recursos."
            )
            .setFooter({ text: "FiveMercado" }),
        ],
      });
    }

    const lista = purchases
      .map((p, i) => {
        const fecha = new Date(p.purchased_at).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const precio = p.price_paid === 0 ? "Gratis" : `🪙 ${p.price_paid}`;
        return `**${i + 1}.** ${p.scripts.title}\n└ ${precio} · ${fecha}`;
      })
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`🛒 Mis Compras — ${user.username}`)
      .setDescription(lista)
      .addFields({
        name: "💡 Descargar",
        value: "Usa `/descargar` para obtener el enlace de cualquier script.",
      })
      .setFooter({
        text: `FiveMercado • ${purchases.length} script${purchases.length !== 1 ? "s" : ""} comprado${purchases.length !== 1 ? "s" : ""}`,
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
