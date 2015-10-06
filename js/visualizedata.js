/*
 * Author: Jonne Kanerva
 * Date: 6.10.2015
 * Currently on to do-list:
 * - Show all relevant item data - INCLUDING UPGRADES AND INFUSIONS
 *
*/

// Event handlers

$("body").on("click", ".character", function() {
  fetchCharacterData($(this).html());
});

$("body").on("mouseover", ".item", function(e) {
  showItemInfo($(this).data("index"), $(this).data("character-item"));
});

$(document).ready( function() {
  getBuildData();
  fetchAccountAndCharacters();
})
