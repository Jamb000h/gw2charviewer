/*
 * Author: Jonne Kanerva
 * Date: 6.10.2015
 * Currently on to do-list:
*/

// API GET functions

function getAccount() {
  console.log("Getting account info!");
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/account",
    data: {access_token: apiKey}
  });
}

function getCharacters() {
  console.log("Getting character names!");
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/characters",
    data: {access_token: apiKey}
  });
}

function getCharacter(characterName) {
  console.log("Getting data for character " + characterName);
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/characters/" + characterName,
    data: {access_token: apiKey}
  });
}

function getItem(id) {
  console.log("Getting data for item " + id);
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/items/" + id
  });
}

function getSpecialization(id) {
  console.log("Getting data for specialization " + id);
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/specializations/" + id
  });
}

function getTrait(id) {
  console.log("Getting data for trait " + id);
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/traits/" + id
  });
}

function getBuild() {
  console.log("Getting build information!");
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/build"
  });
}
