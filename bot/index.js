require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
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
    console.log("here");
    if (interaction.commandName === "petition") {
      let question = interaction.options.getString("sujet");
      let choices = ["oui", "non"];
      const results = {};

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
      for (let i = 0; i < choices.length; i++) {
        await pollMessage.react(`${i + 1}\u20E3`);
      }

      // Attend 10 secondes pour permettre aux utilisateurs de voter
      const collector = pollMessage.createReactionCollector({
        time: 10000,
      });

      // Enregistre les réponses des utilisateurs dans un objet
      collector.on("collect", (reaction, user) => {
        // Enregistre le choix de réponse de l'utilisateur
        const choiceIndex = choices.findIndex(
          (choice, index) => `${index + 1}\u20E3` === reaction.emoji.name
        );

        // Met à jour le nombre de votes pour ce choix de réponse
        results[reaction.emoji.name] = (results[reaction.emoji.name] || 0) + 1;
      });

      // Affiche les résultats une fois le temps écoulé et envoie les votes à un serveur
      collector.on("end", async () => {
        const resultsEmbed = new EmbedBuilder()
          .setTitle(question)
          .setColor(0x00ff00)
          .setDescription(
            choices
              .map(
                (choice, index) =>
                  `${choice}: ${results[`${index + 1}\u20E3`] || 0}`
              )
              .join("\n")
          );
        pollMessage.edit({ embeds: [resultsEmbed] });

        // Envoie les votes à un serveur
        const voteData = {
          question,
          choices,
        };
        console.log(voteData);
        // const response = await fetch("http://example.com/votes", {
        //   method: "POST",
        //   body: JSON.stringify(voteData),
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        // });
        // const responseData = await response.json();
        // console.log(responseData);
      });
    }
  }
});
client.login(token);
