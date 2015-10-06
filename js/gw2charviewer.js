/*
 * Author: Jonne Kanerva
 * Date: 6.10.2015
 * Currently on to do-list:
 * - Refactor all $.when parts - they're currently just huge messes, everything should be neatly refactored into functions
 * - Add API key to localStorage for convenience
 * - Maybe make it so that only the data for the chosen character is fetched - it should both make the app faster and strain the API endpoint less
*/

var testingApiKey = "EE41ABDB-CFCA-DD4C-ACFE-607F4EDCA927A2990A62-4236-491C-8547-74FD120FD239";

var apiKey = testingApiKey;

var buildNumber;

var account; // User account based on API key

var character;

var itemList = []; // List of items fetched based on chosen character

var itemIcons = []; // List for image objects based on fetched items - used for preloading item images

var specializationList = []; // List of specializations fetched based on on chosen character

var traitList = []; // List of traits fetched based on user character on chosen character's specializations

// API GET chain

// Deferreds
var accountDeferred = $.Deferred();
var buildDeferred = $.Deferred();
var characterNamesDeferred = $.Deferred();
var characterDeferred = $.Deferred();
var itemsDeferred = $.Deferred();
var specializationsDeferred = $.Deferred();
var traitsDeferred = $.Deferred();

function getAccountData() {
  $.when(getAccount())
    .done( function(accountData) { // Save account data
      account = accountData;
      console.log("Account info fetched for account " + account.name + "!");
      accountDeferred.resolve(); // Character names fetched
    })
    .fail( function() {
      alert("Something went wrong!");
      accountDeferred.reject("Error!");
    })
}

function getCharactersData() {
  $.when(getCharacters())
    .done( function(charactersData) {
      account.characters = charactersData;
      console.log("Character names fetched!");
      characterNamesDeferred.resolve(); // Character names fetched
    })
    .fail( function() {
      alert("Something went wrong!");
      characterNamesDeferred.reject("Error!");
    })
}

function getBuildData() {
  $.when(getBuild())
    .done( function(buildData) {
      // $.ajax returns data as follows: [data, statusText, jqXHR]
      buildNumber = buildData.id;
      console.log("Build number fetched! Current build number is " + buildNumber);
      buildDeferred.resolve();
    })
    .fail( function() {
      alert("Something went wrong!");
      buildDeferred.reject("Error!");
    })
}

function getCharacterData(characterName) {
  $.when(getCharacter(characterName))
    .done( function(characterData) { // Get and save data for the chosen character
      character = characterData;
      console.log("Data for character " + character.name + " fetched!");
      console.log(character);
      characterDeferred.resolve();
    })
    .fail( function() {
      alert("Something went wrong!");
      characterDeferred.reject("Error!");
    })
}

function getCharacterEquipment() {
  $.when(characterDeferred)
    .done(function() { // Get and save data for the equipment of the chosen character
      console.log("Character data fetched!");
      console.log("Getting item data!");

      var fetchedItems = []; // List for preventing duplicates when fetching item data from API
      var deferreds = []; // Array for deferreds used in the following $.each

      $.each(character.equipment, function() { // Go through all character items and get their data from API
        if($.inArray(this.id, fetchedItems) === -1) { // If item isn't already fetched
          deferreds.push(getItem(this.id)); // Add promise to the array
          fetchedItems.push(this.id); // Add to array of fetched items
        }
        if(this.upgrades) { // If item has upgrades
          for(var i = 0; i < this.upgrades.length; i++) { // Go through all the found upgrades of the item
            if($.inArray(this.upgrades[i], fetchedItems) === -1) { // If item isn't already fetched
              deferreds.push(getItem(this.upgrades[i])); // Add promise to the array
              fetchedItems.push(this.upgrades[i]); // Add to array of fetched items
            }
          }
        }

      })

    $.when.apply($, deferreds).done( function() { // When all item data is fetched
      for(var i = 0; i < arguments.length; i++) { // The function gets all promises as an array, iterate via arguments
        // $.ajax returns data as follows: [data, statusText, jqXHR]
        itemList.push(arguments[i][0]);
        // Preload item icons
        var icon = new Image();
        icon.src = arguments[i][0].icon;
        icon.alt = arguments[i][0].name;
        if(arguments[i][0].type == "UpgradeComponent") {
          $(icon).addClass("upgrade");
        } else {
          $(icon).addClass("item");
        }
        itemIcons.push(icon);

        console.log("Data for item " + arguments[i][0].name + " fetched!");
      }
      itemsDeferred.resolve();
    })
  })
  .fail( function() {
    alert("Something went wrong!");
    itemsDeferred.reject("Error");
  })
}

function getcharacterSpecializations() {
  $.when(characterDeferred)
    .done(function() { // Get and save data for all specializations found
      console.log("Getting specialization data!");
      var fetchedSpecializations = []; // List for preventing duplicates when fetching specialization data from API
      var deferreds = []; // Array for deferreds used in the following $.each
      $.each(character.specializations, function() { // Iterate through all specializations [pve, pvp, www]
        for(var i = 0; i < 3; i++) { // Iterate through a single specialization type (a character can have 3 specializations active)
          if(this[i] != null) { // If the specialization isn't null
            if($.inArray(this[i].id, fetchedSpecializations) === -1) { // If specialization isn't already fetched
              if(this[i].id != 5) { // REMOVE WHEN DRUID IS AVAILABLE IN THE SPECIALIZATION API ENDPOINT!!!
              deferreds.push(getSpecialization(this[i].id)); // Add promise to the array
              fetchedSpecializations.push(this[i].id); // Add to array for duplicate checking
              }
            }
          }
        }
      })
      $.when.apply($, deferreds).done( function() { // When all specialization data is fetched
        for(var i = 0; i < arguments.length; i++) { // The function gets all promises as an array, iterate via arguments
          // $.ajax returns data as follows: [data, statusText, jqXHR]
          specializationList.push(arguments[i][0]);
          console.log("Data for specialization " + arguments[i][0].name + " fetched!");
        }
        specializationsDeferred.resolve();
      })
  })
  .fail( function() {
    alert("Something went wrong!");
    specializationsDeferred.reject("Error");
  })
}

function getCharacterTraits() {
  $.when(characterDeferred)
    .done(function() { // Get and save data for all traits found
      console.log("Getting trait data!");
      var fetchedTraits = []; // List for preventing duplicates when fetching trait data from API
      var deferreds = []; // Array for deferreds used in the following $.each
      $.each(character.specializations, function() { // Iterate through all specializations [pve, pvp, www]
        for(var i = 0; i < 3; i++) { // Iterate through a single specialization type (a character can have 3 specializations active)
          if(this[i] != null) { // If the specialization isn't null
              if(this[i].id != 5) { // REMOVE WHEN DRUID IS AVAILABLE IN THE SPECIALIZATION API ENDPOINT!!!
              for(var j = 0; j < this[i].traits.length; j++) { // Go through specialization traits equipped
                if(this[i].traits[j] != null) {
                  if($.inArray(this[i].traits[j], fetchedTraits) === -1) { // If trait isn't already fetched
                    deferreds.push(getTrait(this[i].traits[j])); // Add promise to the array
                    fetchedTraits.push(this[i].traits[j]); // Add to array for duplicate checking
                  }
                }
              }
              }
            }
          }
        })
      $.when.apply($, deferreds).done( function() { // When all specialization data is fetched
        for(var i = 0; i < arguments.length; i++) { // The function gets all promises as an array, iterate via arguments
          // $.ajax returns data as follows: [data, statusText, jqXHR]
          traitList.push(arguments[i][0]);
          console.log("Data for trait " + arguments[i][0].name + " fetched!");
        }
        traitsDeferred.resolve();
    })
    .fail(function() {
      alert("Something went wrong!");
      traitsDeferred.reject("Error");
    })
  })
}

function fetchAccountAndCharacters() {
  getAccountData();
  $.when(accountDeferred).done( function() {
    getCharactersData();
  })
  $.when(characterNamesDeferred).done( function() {
    printCharacters();
  })
}

function fetchCharacterData(characterName) {
  getCharacterData(characterName);
  $.when(characterDeferred).done( function() {
    printCharacter();
    getCharacterEquipment();
    getcharacterSpecializations();
    getCharacterTraits();
  })
  $.when(itemsDeferred).done( function() {
    printItems();
  })
  $.when(specializationsDeferred).done( function() {
      // printSpecializations();
  })
  $.when(traitsDeferred).done( function() {
      // printTraits();
  })
}

function printCharacters() {
  console.log("SHOW ALL CHARACTERS!");
  var target = $("#characterList");
  $.each(account.characters, function(index) { // Print characters
    target.append("<a class=\"character\" data-id=\"" + index + "\">" + this + "</a><br />");
  })
}

function printCharacter() {
  console.log("SHOW SINGLE CHARACTER!");
  var target = $("#characterInfo");
  target.append("<p>" + character.name + "</p>");
  target.append("<p>" + character.level + "</p>");
  target.append("<p>" + character.race + "</p>");
  target.append("<p>" + character.profession + "</p>");
  // ADD MORE INFORMATION
}

function printItems() {
  console.log("SHOW ITEMS!");
  var target = $("#itemList");
  $.each(character.equipment, function(index, value) {
    var target = $("#" + this.slot);
    var item;
    var itemIndex;
    for(var i = 0; i < itemList.length; i++) {
      if(itemList[i].id === this.id) {
        itemIndex = i;
        item = itemList[i];
      }
    }
    var itemIcon = itemIcons[itemIndex];
    $(itemIcon).data("index", itemIndex);
    $(itemIcon).data("character-item", index);
    target.append(itemIcons[itemIndex]);
  })
}

function showItemInfo(itemIndex, characterItemIndex) {
  var itemInfo = $("#itemInfo");
  itemInfo.empty();
  var item = itemList[itemIndex];
  var characterItem = character.equipment[characterItemIndex];
  var upgrade;
  itemInfo.append("<img src=\"" + item.icon + "\" />");
  itemInfo.append("<p class=\"" + item.rarity + "\">" + item.name + "</p>");
  if(item.details.defense) {
    itemInfo.append("<p>Defense: " + item.details.defense + "</p>");
  }
  if(item.details.infix_upgrade) {
    $.each(item.details.infix_upgrade.attributes, function() {
      itemInfo.append("<p>+" +  $(this)[0].modifier + " " + $(this)[0].attribute + "</p>");
    })
  }
  itemInfo.append("<p>" + item.type + "</p>");
  itemInfo.append("<p>" + item.rarity + "</p>");
  itemInfo.append("<p>" + item.level + "</p>");
  if(item.details.type) {
    itemInfo.append("<p>" + item.details.type + "</p>");
  }
  if(item.type == "Weapon") {
    itemInfo.append("<p>" + item.details.min_power + " - " + item.details.max_power + "</p>");
  }
  if(characterItem.upgrades) {
    console.log(characterItem.upgrades.length + " upgrades!");
    $.each(characterItem.upgrades, function() {
      console.log(characterItem.upgrades.length + " upgrades!");
      for(var i = 0; i < itemList.length; i++) {
        if(itemList[i].id == $(this)[0]) {
          upgrade = itemList[i];
          itemInfo.append(itemIcons[i]);
          itemInfo.append("<p>" + upgrade.name + "</p>");
        }
      }
    })
  }
}
