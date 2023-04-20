require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios");
const fs = require('fs');

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
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
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




const token = fs.readFileSync(process.env.TOKEN_FILE, 'utf8');
const API_URL = process.env.API_URL;
console.log(token);

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
    console.log("here");
    if (interaction.commandName === "petition") {
      const results = {};
      let id_petition = "";
      question = interaction.options.getString("sujet");
      const body = {
        username: interaction.member.user.username,
        sujet: question,
      };

      try {
        const res = await axios.post(API_URL + "/petition", body);
        id_petition = res.data.insertedId;
      } catch (err) {
        console.log(err);
      }

      let choices = ["oui", "non"];
      let choiceIndex;
      // Crée un message avec la question et les choix de réponses
      const pollMessage = await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(question)
            .setDescription(
              choices
                .map((choice, index) => `${index + 1}. ${choice}`)
                .join("\n")
            )
            .setColor(0x0099ff),
        ],
        fetchReply: true,
      });

      // Ajoute des réactions pour chaque choix de réponse
      await pollMessage.react(`\uD83D\uDC4D`);
      await pollMessage.react(`\uD83D\uDC4E`);

      const filter = (reaction, user) => !user.bot;

      // Attend 10 secondes pour permettre aux utilisateurs de voter
      const collector = pollMessage.createReactionCollector({
        filter,
        dispose: true,
        time: 10000,
      });
      const emojis = ["\uD83D\uDC4D", "\uD83D\uDC4E"];

      // Enregistre les réponses des utilisateurs dans un objet
      collector.on("collect", (reaction, user) => {
        const emojiIndex = emojis.indexOf(reaction.emoji.name);
        if (emojiIndex !== -1) {
          // Met à jour le nombre de votes pour ce choix de réponse
          results[emojiIndex] = (results[emojiIndex] || 0) + 1;
        }
      });

      collector.on("remove", (reaction, user) => {
        console.log("test");
        // Vérifie si l'utilisateur a déjà voté pour ce choix de réponse
        const choiceIndex = choices.findIndex(
          (choice, index) =>
            `${index + 1}` +
              (choice.includes("0👍")
                ? "\uD83D\uDC4D"
                : choice.includes("0👎")
                ? "\uD83D\uDC4E"
                : "\u20E3") ===
            "0",
          reaction.emoji.name
        );

        const emojiIndex = emojis.indexOf(reaction.emoji.name);
        if (emojiIndex !== -1) {
          // Met à jour le nombre de votes pour ce choix de réponse
          results[emojiIndex] = (results[emojiIndex] || 0) - 1;
        }
      });

      // Affiche les résultats une fois le temps écoulé et envoie les votes à un serveur
      collector.on("end", async () => {
        const oui = results[0];
        const non = results[1];
        const resultsEmbed = new EmbedBuilder()
          .setTitle(question)
          .setColor(0x00ff00)
          .setDescription(`${oui || 0} 👍, ${non || 0} 👎`);
        pollMessage.edit({ embeds: [resultsEmbed] });
        console.log(
          `Il y a ${oui} votes pour "oui" et ${non} votes pour "non"`
        );
        const body = {
          yes: results[0] || 0,
          no: results[1] || 0,
        };

        try {
          console.log("here");
          const res = await axios.post(
            API_URL + "/petition/" + id_petition,
            body
          );
          id_petition = res.data.insertedId;
        } catch (err) {
          console.log(err);
        }
      });
    }
  }
});
client.login(token);