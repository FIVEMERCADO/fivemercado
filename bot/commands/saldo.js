const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db, getUserByDiscordId } = require("../lib/supabase");

const COLOR = 0x2cade0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("Ver tu saldo de créditos en FiveMercado"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const supabase = db();
    const user = await getUserByDiscordId(interaction.user.id);

    if (!user) {
      return interaction.editReply({
        content:
          "❌ Tu Discord no está vinculado a FiveMercado.\n➡️ Inicia sesión en la web para vincular tu cuenta.",
      });
    }

    // Últimas 5 transacciones
    const { data: txs } = await supabase
      .from("transactions")
      .select("type, amount, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const historial = txs?.length
      ? txs
          .map((t) => {
            const signo = t.amount >= 0 ? "+" : "";
            const icon =
              t.type === "PAYPAL_TOPUP" ? "💳" : t.type === "PURCHASE" ? "🛒" : t.type === "SCRIPT_SALE" ? "💰" : "📥";
            return `${icon} \`${signo}${t.amount}\` — ${t.description.slice(0, 40)}`;
          })
          .join("\n")
      : "Sin transacciones recientes.";

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`🪙 Saldo de ${user.username}`)
      .addFields(
        {
          name: "Créditos disponibles",
          value: `## 🪙 ${user.credits.toLocaleString("es-ES")}`,
          inline: false,
        },
        {
          name: "Últimas transacciones",
          value: historial,
          inline: false,
        }
      )
      .addFields({
        name: "💡 Comprar créditos",
        value: "Visita `/credits` en la web para recargar tu saldo via PayPal.",
      })
      .setFooter({ text: "FiveMercado" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
