const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { db, getUserByDiscordId } = require("../lib/supabase");
const { generateDownloadUrl } = require("../lib/hmac");

const COLOR = 0x2cade0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verificar")
    .setDescription("[Admin] Ver y gestionar las compras de un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Usuario de Discord a verificar").setRequired(true)
    )
    .addBooleanOption((opt) =>
      opt.setName("enviar-link").setDescription("Enviar link de descarga al usuario por DM (requiere seleccionar compra)").setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target    = interaction.options.getUser("usuario");
    const sendLink  = interaction.options.getBoolean("enviar-link") ?? false;
    const supabase  = db();

    const user = await getUserByDiscordId(target.id);
    if (!user) {
      return interaction.editReply({
        content: `❌ **${target.username}** no tiene cuenta vinculada en FiveMercado.\n→ Debe iniciar sesión con Discord en la web primero.`,
      });
    }

    // Obtener compras con info del script
    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("id, price_paid, created_at, script_id, scripts(title, version)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !purchases?.length) {
      return interaction.editReply({
        content: `ℹ️ **${target.username}** no tiene compras registradas en FiveMercado.`,
      });
    }

    const listLines = purchases.map((p, i) => {
      const ts = Math.floor(new Date(p.created_at).getTime() / 1000);
      return `\`${i + 1}.\` **${p.scripts?.title ?? p.script_id}** — ${p.price_paid} cr — <t:${ts}:R>`;
    });

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`🛒 Compras de ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .setDescription(listLines.join("\n"))
      .addFields(
        { name: "Total compras",    value: `${purchases.length}`,                      inline: true },
        { name: "Créditos gastados",value: `${purchases.reduce((a, p) => a + p.price_paid, 0)} cr`, inline: true },
        { name: "ID de cuenta",     value: `\`${user.id}\``,                           inline: false }
      )
      .setFooter({ text: "FiveMercado Admin" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // Si el admin pidió enviar links, mandar DM con todos los links de descarga
    if (sendLink) {
      try {
        const linkLines = [];
        for (const p of purchases) {
          const url = await generateDownloadUrl(supabase, p.script_id, user.id);
          linkLines.push(`**${p.scripts?.title ?? p.script_id}**\n${url}`);
        }

        const dmEmbed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle("📥 Links de descarga — enviados por Staff")
          .setDescription(
            `Un miembro del staff de FiveMercado te envió los siguientes links de descarga.\n\n` +
            `> ⚠️ Cada link expira en **5 minutos** y es de **un solo uso**.\n` +
            `> 🔄 Usa \`/descargar\` para generar nuevos links.`
          )
          .addFields(
            linkLines.map((l, i) => ({ name: `Script ${i + 1}`, value: l, inline: false }))
          )
          .setFooter({ text: "FiveMercado" })
          .setTimestamp();

        await target.send({ embeds: [dmEmbed] });
        await interaction.followUp({ content: `✅ Links enviados a ${target.username} por DM.`, ephemeral: true });
      } catch {
        await interaction.followUp({
          content: `⚠️ No se pudo enviar DM a ${target.username} (tiene los DMs desactivados).`,
          ephemeral: true,
        });
      }
    }
  },
};
