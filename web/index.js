const express = require("express");
const app = express();
const axios = require("axios");
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");

const API_URL = process.env.API_URL || "http://127.0.0.1:3000";

app.use(bodyParser.json());

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

app.get("/", async (req, res) => {
  var petitions = [];
  try {
    const resultat = await axios.get(API_URL + "/petitions");
    console.log(resultat.data)
    petitions = resultat.data;
  } catch (err) {
    console.log(err);
  }

  res.render("index", { petitions: petitions});

});


app.listen(port, () => {
  console.log(`Start on port => ${port}`);
});
