require("dotenv").config();
const express = require("express");
const app = express();
const port = 3001;
const axios = require("axios");

app.get("/health", async (req, res) => {
  if (process.env.API_URL == undefined) {
    res.status(500).send("Error");
  }

  var result = await axios.get(process.env.API_URL + "/health");
  if (result.status == 200) {
    res.status(200).send("OK");
  } else {
    res.status(500).send("Error");
  }
});

app.listen(port, () => {
  console.log(`Start on port => ${port}`);
});
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ReactionCollector,
} = require("discord.js");
client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.MessageContent,
  ],
});

const token = process.env.TOKEN;
console.log(process.env.TOKEN);

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

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName === "petition") {
      let id_petition = "";
      question = interaction.options.getString("sujet");
      const body = {
        username: interaction.member.user.username,
        sujet: question,
      };

      try {
        const res = await axios.post("http://127.0.0.1:3000/petition", body);
        id_petition = res.data.insertedId;
      } catch (err) {
        console.log(err);
      }
      let choices = ["oui", "non"];
      let emojis = ["👍", "👎"];

      const msg = new EmbedBuilder()
        .setTitle(question)
        .setDescription(
          choices
            .map((choice, index) => `${emojis[index]}. ${choice}`)
            .join("\n\n")
        )
        .setColor(0x0099ff);

      // Crée un message avec la question et les choix de réponses
      await interaction.reply({
        embeds: [msg],
        fetchReply: true,
      });
      const message = await interaction.fetchReply();

      // Ajoute des réactions pour chaque choix de réponse
      await message.react("👍");
      await message.react("👎");

      // Initialise le collector pour les réactions
      const filter = (reaction, user) => {
        return ["👍", "👎"].includes(reaction.emoji.name) && !user.bot;
      };

      const collector = message.createReactionCollector({
        filter,
        time: 15000,
      });
      const results = {
        yes: 0,
        no: 0,
      };
      // Enregistre les réactions des utilisateurs
      collector.on("collect", async (reaction, user) => {
        console.log(`${user.username} reacted with ${reaction.emoji.name}`);

        if (["👍"].includes(reaction.emoji.name)) {
          results.yes++;
        } else if (["👎"].includes(reaction.emoji.name)) {
          results.no++;
        }
      });

      collector.on("remove", (reaction, user) => {
        console.log("test");
        if (["👍"].includes(reaction.emoji.name)) {
          results.yes--;
        } else if (["👎"].includes(reaction.emoji.name)) {
          results.no--;
        }
      });

      // Affiche les résultats du sondage
      collector.on("end", async (collected) => {
        console.log(`Collected ${collected.size} items`);

        const body = {
          results: results,
        };

        try {
          console.log("here");
          const res = await axios.post(
            "http://127.0.0.1:3000/petition/" + id_petition,
            body
          );
          id_petition = res.data.insertedId;
        } catch (err) {
          console.log(err);
        }

        const resultEmbed = new EmbedBuilder()
          .setTitle(question)
          .setDescription(`${results.yes || 0} 👍, ${results.no || 0} 👎`)
          .setColor(0x00ff00);

        await interaction.channel.send({ embeds: [resultEmbed] });

        // Enregistre les réactions des utilisateurs dans une base de données ou fait quelque chose d'autre avec les réactions
        console.log(results);
      });
    }
  }
});
client.login(token);
