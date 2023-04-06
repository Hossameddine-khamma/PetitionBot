const { Client, GatewayIntentBits } = require("discord.js");
client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const token =
  "MTA5MzUwNjIwNjgwODY4MjU4Ng.Gtye2D.C6HEGyixJFbjWhx0fTZsmzIfSPeI_gVIEfsIA4";

client.once("ready", () => {
  console.log(
    "Félicitations, votre bot Discord a été correctement initialisé !"
  );
});

client.login(token);
