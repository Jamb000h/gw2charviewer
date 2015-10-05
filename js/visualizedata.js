var target = $("#wrapper");
var itemInfo = $("#itemInfo");

var character;

function printCharacters() {
  $.each(account.characters, function(index) { // Print characters
    target.append("<a class=\"character\" data-id=\"" + index + "\">" + this.name + "</a><br />");
  })
}

function printCharacter(id) {
  character = account.characters[id];
  target.append("<p>" + character.name + "</p>");
  target.append("<p>" + character.level + "</p>");
  target.append("<p>" + character.race + "</p>");
  target.append("<p>" + character.profession + "</p>");
  printItems(id);
}

function printItems(id) {
  $.each(character.equipment, function() {
    var item;
    var itemIndex;
    for(var i = 0; i < itemList.length; i++) {
      if(itemList[i].id === this.id) {
        itemIndex = i;
        item = itemList[i];
      }
    }
    target.append("<img data-index=\"" + itemIndex + "\" class=\"item\" alt=\"" + item.name + "\" src=\"" + item.icon + "\"/>");
  })
}

function showItemInfo(index) {
  itemInfo.empty();
  var item = itemList[index];
  itemInfo.append("<p>" + item.name + "</p>");
  itemInfo.append("<p>" + item.type + "</p>");
  itemInfo.append("<p>" + item.rarity + "</p>");
  itemInfo.append("<p>" + item.level + "</p>");
  if(item.details.type) {
    itemInfo.append("<p>" + item.details.type + "</p>");
  }
  if(item.type == "Weapon") {
    itemInfo.append("<p>" + item.details.min_power + " - " + item.details.max_power + "</p>");
  }
}

// Event handlers

$(target).on("click", ".character", function() {
  target.empty();
  var id = $(this).data("id");
  printCharacter(id);
});

$(target).on("mouseover", ".item", function() {
  showItemInfo($(this).data("index"));
});
