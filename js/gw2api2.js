var testingApiKey = "EE41ABDB-CFCA-DD4C-ACFE-607F4EDCA927A2990A62-4236-491C-8547-74FD120FD239";

function Account() {
  this.name = "";
}

function Character() {
  this.name = "";
  this.race = "";
  this.profession = "";
  this.level;
  this.equipment = [];
  this.specializations = [];
}

function Equipment() {
  this.id = "";
  this.name = "";
  this.icon = "";
  this.skin = "";
  this.slot = "";
  this.rarity = "";
  this.type = "";
  this.weaponType = "";
  this.minDmg;
  this.maxDmg;
  this.upgrades = [];
}

var equipments = [];
var account = new Account();
var character = new Character();

function getAccount() {
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/account",
    data: {access_token: testingApiKey}
  });
}

function getCharacters() { // Not used atm
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/characters",
    data: {access_token: testingApiKey}
  });
}

function getCharacter() { // Add char name
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/characters/Ronano",
    data: {access_token: testingApiKey}
  });
}

function getItem(id) {
  return $.ajax( {
    dataType: "json",
    url: "https://api.guildwars2.com/v2/items/" + id,
    data: {access_token: testingApiKey}
  });
}

/*$.when(getAccount()).then(function(json) { Not used atm
  account.name = json.name;
  console.log(account.name);
});*/

$.when(getCharacter()).then( function(json) {
  character.name = json.name;
  character.race = json.race;
  character.profession = json.profession;
  character.level = json.level;
  $.each(json.equipment, function() {
    character.equipment.push(this);
  })
  $.each(json.specializations, function() {
    character.specializations.push(this);
  })
  console.log(character);
}).then( function() {
  getItems();
  //getSpecializations();
}).then( function() {
  setTimeout( function() { // For some reason a small delay is required...
    showItems();
  }, 100);
});

function getItems() {
  var def = $.Deferred();
  $.each(character.equipment, function() {
    var equipment = new Equipment();
    equipment.id = this.id;
    equipment.slot = this.slot;
    equipment.skin = this.skin;
    $.when(getItem(this.id)).done(function(json) {
      equipment.icon = json.icon;
      equipment.rarity = json.rarity;
      equipment.name = json.name;
      equipment.type = json.type;
      if(json.type === "Weapon") {
        equipment.weaponType = json.details.type;
        equipment.minDmg = json.details.min_power;
        equipment.maxDmg = json.details.max_power;
      }
    });
    if(this.upgrades) {
      $.each(this.upgrades, function() {
        $.when(getItem(this)).done(function(json) {
          equipment.upgrades.push(json);
        });
      });
    }
    def.resolve();
    equipments.push(equipment);
  })
  return def.promise();
}

function showItems() {
  $.each(equipments, function(index, value) {
    var html = "<div class=\"item\" data-id=\"" + index + "\">";
    html += "<img alt=\"" + this.name + "\" src=\"" + this.icon + "\" />";
    html += "</div>";
    $("body").append(html);
  })
}

/*$.when(getCharacters()).then(function(json) { // Not used atm
  $.each(json, function(index, value) {
  });
});*/

$("body").on("mouseover", ".item", function() {
  showInfo($(this).data("id"));
});

function showInfo(id) {
  $("#infoName").html(equipments[id].name);
  $("#infoSlot").html(equipments[id].slot);
  if(equipments[id].weaponType != "") {
    $("#infoWeaponType").html(equipments[id].weaponType);
    $("#infoWeaponDamage").html(equipments[id].minDmg + " - " + equipments[id].maxDmg);
  } else {
    $("#infoWeaponType, #infoWeaponDamage").html("");
  }
  if(equipments[id].upgrades.length > 0) {
    $("#infoUpgrades").html("");
    for(var i = 0; i < equipments[id].upgrades.length; i++ ) {
      $("#infoUpgrades").append(equipments[id].upgrades[i].name + "<br />");
    }
  } else {
    $("#infoUpgrades").html("");
  }
}
