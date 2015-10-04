var testingApiKey = "EE41ABDB-CFCA-DD4C-ACFE-607F4EDCA927A2990A62-4236-491C-8547-74FD120FD239";

var apiKey = "EE41ABDB-CFCA-DD4C-ACFE-607F4EDCA927A2990A62-4236-491C-8547-74FD120FD239";

var account; // User account based on API key

var itemList = []; // List of items fetched based on user characters

var specializationList = [];

var traitList = [];

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

// API GET chain

// Deferreds
var characterNamesDeferred = $.Deferred();
var charactersDeferred = $.Deferred();
var itemsDeferred = $.Deferred();
var specializationsDeferred = $.Deferred();
var traitsDeferred = $.Deferred();

$.when(getAccount(), getCharacters()).done(function(accountData, charactersData) { // Save account and character data
  // $.ajax returns data as follows: [data, statusText, jqXHR]
  accountData = accountData[0];
  charactersData = charactersData[0];

  account = accountData;
  console.log("Account info fetched for account " + account.name + "!");

  account.characters = charactersData;

  characterNamesDeferred.resolve(); // Character names fetched
});

$.when(characterNamesDeferred).done(function() { // Get and save data for all characters
  console.log("Character names fetched!");
  console.log("Getting character data");

  var deferreds = []; // Array for deferreds used in the following $.each

  $.each(account.characters, function(index, value) { // Go through all characters and get their data from API
    deferreds.push(getCharacter(this)); // Add promise to the array
  });

  $.when.apply($, deferreds).done( function() { // When all character data is fetched
    for(var i = 0; i < arguments.length; i++) { // The function gets all promises as an array, iterate via arguments
      // $.ajax returns data as follows: [data, statusText, jqXHR]
      account.characters[i] = arguments[i][0];
      console.log("Data for character " + arguments[i][0].name + " fetched!");
      console.log(account.characters[i]);
    }
    charactersDeferred.resolve();
  })
})

$.when(charactersDeferred).done(function() { // Get and save data for the equipment of characters
  console.log("Character data fetched!");
  console.log("Getting item data!");
  var fetchedItems = []; // List for preventing duplicates when fetching item data from API
  var deferreds = []; // Array for deferreds used in the following $.each
  $.each(account.characters, function() { // Go through all characters
    $.each(this.equipment, function() { // Go through all character items and get their data from API
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
  })
  $.when.apply($, deferreds).done( function() { // When all item data is fetched
    for(var i = 0; i < arguments.length; i++) { // The function gets all promises as an array, iterate via arguments
      // $.ajax returns data as follows: [data, statusText, jqXHR]
      itemList.push(arguments[i][0]);
      console.log("Data for item " + arguments[i][0].name + " fetched!");
    }
  })
  itemsDeferred.resolve();
})

$.when(charactersDeferred).done(function() { // Get and save data for all specializations found
  console.log("Getting specialization data!");
  var fetchedSpecializations = []; // List for preventing duplicates when fetching specialization data from API
  var deferreds = []; // Array for deferreds used in the following $.each
  $.each(account.characters, function() { // Iterate through characters
    $.each(this.specializations, function() { // Iterate through all specializations [pve, pvp, www]
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
  })
  $.when.apply($, deferreds).done( function() { // When all specialization data is fetched
    for(var i = 0; i < arguments.length; i++) { // The function gets all promises as an array, iterate via arguments
      // $.ajax returns data as follows: [data, statusText, jqXHR]
      specializationList.push(arguments[i][0]);
      console.log("Data for specialization " + arguments[i][0].name + " fetched!");
    }
  })
  specializationsDeferred.resolve();
})

$.when(charactersDeferred).done(function() { // Get and save data for all traits found
  console.log("Getting trait data!");
  var fetchedTraits = []; // List for preventing duplicates when fetching trait data from API
  var deferreds = []; // Array for deferreds used in the following $.each
  $.each(account.characters, function() { // Iterate through characters
    $.each(this.specializations, function() { // Iterate through all specializations [pve, pvp, www]
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
    })
  $.when.apply($, deferreds).done( function() { // When all specialization data is fetched
    for(var i = 0; i < arguments.length; i++) { // The function gets all promises as an array, iterate via arguments
      // $.ajax returns data as follows: [data, statusText, jqXHR]
      traitList.push(arguments[i][0]);
      console.log("Data for trait " + arguments[i][0].name + " fetched!");
    }
  })
  traitsDeferred.resolve();
})
