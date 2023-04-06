const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require("discord.js");
client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const token =
  "MTA5MzUwNjIwNjgwODY4MjU4Ng.G-fbV0.0Mxm6q12wPpkBB78xdE0amkYXJQ5Wfh8GHUFCs";

const petitionCommande = new SlashCommandBuilder()
  .setName("petition")
  .setDescription("permet de creer une pétition")
  .addStringOption((option) =>
    option
      .setName("sujet")
      .setDescription("le sujet de la pétition")
      .setRequired(true)
  );

client.once("ready", () => {
  const applicationCommandes = client.guilds.cache.get(
    "1027948267922784389"
  ).commands;
  applicationCommandes.create(petitionCommande);
  console.log(
    "Félicitations, votre bot Discord a été correctement initialisé !"
  );
});

client.on("interactionCreate", (interaction) => {
  if (interaction.isCommand()) {
    console.log("here");
    if (interaction.commandName === "petition") {
      let sujet = interaction.options.getString("sujet");
      interaction.reply(`la pétition pour le sujet ${sujet} a été crée`);
    }
  }
});
client.login(token);
