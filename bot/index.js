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
    console.log("here");
    if (interaction.commandName === "petition") {
      const results = {};
      let question = interaction.options.getString("sujet");
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

      const filter = (reaction, user) => !user.bot

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
        // Vérifie si l'utilisateur a déjà voté pour ce choix de réponse
        const choiceIndex = choices.findIndex(
          (choice, index) =>
            `${index + 1}` + (choice.includes("0👍") ? "\uD83D\uDC4D" : choice.includes("0👎") ? "\uD83D\uDC4E" : "\u20E3") === "0",reaction.emoji.name
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
            .setDescription( `${oui || 0} 👍, ${non || 0} 👎`);
        pollMessage.edit({ embeds: [resultsEmbed] });
        console.log(`Il y a ${oui} votes pour "oui" et ${non} votes pour "non"`);
        // Envoie les votes à un serveur
        const voteData = {
          question,
          choices,
          oui,
          non
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
