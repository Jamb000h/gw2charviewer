var testingApiKey = "EE41ABDB-CFCA-DD4C-ACFE-607F4EDCA927A2990A62-4236-491C-8547-74FD120FD239";

var apiKey = "EE41ABDB-CFCA-DD4C-ACFE-607F4EDCA927A2990A62-4236-491C-8547-74FD120FD239";

function Account() {
  this.name = "";
  this.characters;
}

function Character() {
  this.name = "";
  this.race = "";
  this.profession = "";
  this.level;
  this.equipment = [];
  this.specializations = [];
}

var account = new Account();

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

// API GET chain

// Deferreds
var characterNames = $.Deferred();
var characters = $.Deferred();
var items = $.Deferred();

$.when(getAccount(), getCharacters()).done(function(accountData, charactersData) {
  // $.ajax returns data as follows: [data, statusText, jqXHR]
  accountData = accountData[0];
  charactersData = charactersData[0];

  account.name = accountData.name;
  console.log("Account info fetched!");

  account.characters = charactersData;

  characterNames.resolve(); // Character names fetched
});

$.when(characterNames).done(function() {
  console.log("Character names fetched!");
  console.log("Getting character data");

  var deferreds = [];

  $.each(account.characters, function(index, value) {
    deferreds.push(getCharacter(this));
  });

  $.when.apply($, deferreds).done( function() { // Characters fetched
    for(var i = 0; i < arguments.length; i++) {
      // $.ajax returns data as follows: [data, statusText, jqXHR]
      account.characters[i] = arguments[i][0];
      console.log("Data for character " + arguments[i][0].name + " fetched!");
    }
    characters.resolve();
  })
})

$.when(characters).done(function() {
  console.log("Character data fetched!");
});
