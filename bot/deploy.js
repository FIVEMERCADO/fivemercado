// Registra todos los slash commands en Discord.
// Ejecutar una vez al añadir/modificar comandos: node bot/deploy.js

const { REST, Routes } = require("discord.js");
const fs   = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const commands = [];
const commandsPath = path.join(__dirname, "commands");

for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"))) {
  const { data } = require(path.join(commandsPath, file));
  if (data) commands.push(data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  console.log(`📡 Registrando ${commands.length} comandos en Discord...`);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    console.log(`✅ ${commands.length} comandos registrados:`);
    commands.forEach((c) => console.log(`   /${c.name} — ${c.description}`));
  } catch (err) {
    console.error("❌ Error registrando comandos:", err);
    process.exit(1);
  }
})();
