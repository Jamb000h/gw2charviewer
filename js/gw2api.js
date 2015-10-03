var testingApiKey = "EE41ABDB-CFCA-DD4C-ACFE-607F4EDCA927A2990A62-4236-491C-8547-74FD120FD239";

function Account() {
  this.id = "";
  this.name = "";
  this.world = "";
  this.guilds = [];
  this.created = "";
}

function Guild() {
  this.id = "";
  this.name = "";
  this.tag = "";
  this.emblem;
}

var account = new Account();

var guilds = [];

function getBuild() {
  var def = $.Deferred();
  $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/build"
  });
  return def.promise();
}

function getAccount() {
  var def = $.Deferred();
  $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/account",
    data: {access_token: testingApiKey}
  });
  return def.promise();
}

function getGuild(guildId) {
  $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v1/guild_details.json",
    data: {guild_id: guildId},
      success: function(json) {
      var guild = new Guild();
      guild.guild_id = json.guild_id;
      guild.guild_name = json.guild_name;
      guild.tag = json.tag;
      guild.emblem = json.emblem;
      guilds.push(guild);
  }
  });
}

function getGuilds() {
  var def = $.Deferred();
  $.each(account.guilds, function(index) {
    getGuild(this);
  })
  return def.promise();
}

function showGuilds() {
  $.each(guilds, function() {
    console.log(this.guild_name);
  })
}

// Print the build number
getBuild().done(function(json) {
  console.log("Current build number is :" + json.id);
});

/*getAccount().done( function(json) {
  account.id = json.id;
  account.name = json.name;
  account.world = json.world;
  account.created = json.created;
  $.each(json.guilds, function(index, value) {
    account.guilds.push(value);
  });
  getGuilds().done( function() {
    showGuilds();
  })
})*/
