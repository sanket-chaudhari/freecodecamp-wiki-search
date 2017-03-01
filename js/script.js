//  ================
//  GLOBAL VARIABLES
//  ================

var suggestionsContainerHidden = true; //Initially, the container is hidden - when the top section slides up, the container should become visible after a delay
var translateYValue;

function search() {
  $.ajax({
    url: url + escape($("#search").val()),
    jsonp: "callback",
    dataType: "jsonp",
    success: function(resp) {
      // Empty before inserting everything
      $("#results").empty();
      for (var i=0; i<resp[1].length; i++) {
        insertHTML(resp[1][i], resp[2][i], resp[3][i]);
      }
    }
  });
}

//  ==========
//  FUNCTIONS
//  ==========

function fetchSearchTermSuggestions(searchTerm){

  //generate requestURL
  let requestURL = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="+searchTerm+"&utf8=1";

  //fetch and display data
  // $.getJSON(requestURL, function(data){
  //   //console.log(data);
  //   let suggestionTermsArr = data[1];
  //   displaySearchTermSuggestions(suggestionTermsArr);
  //
  // });

  $.ajax({
      url: requestURL,
      jsonp: "callback",
      dataType: "jsonp",
      success: function(data) {
        // Empty before inserting everything
        let suggestionTermsArr = data[1];
        displaySearchTermSuggestions(suggestionTermsArr);
        }
      });
}


function fetchSearchResults(searchTerm){
  //generate request URL
  let requestURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch="+searchTerm;

  //Fetch response as a JSON object
  // $.getJSON(requestURL, function(data){
  //
  //   //Grab the required stuff from the resultant data object.
  //   let responseObj = data.query.pages;
  //   let searchResultsArr = [];
  //
  //   //Create an array with the search results --- format : [[searchIndex, {searchResultObj}],[,{}],...]
  //   //This shall help us sort the results according to their search index value as returned by the wiki api
  //   $.each(responseObj, function(key, val){
  //     let title = val.title;
  //     let titleExtractPairObj = {};
  //     titleExtractPairObj[title] = val.extract
  //     searchResultsArr.push([val['index'], titleExtractPairObj]);
  //   });
  //
  //   //Sort the search results by their search result index
  //   searchResultsArr.sort(function(a,b){
  //     return a[0] - b[0];
  //   });
  //
  //   //Display Search Results
  //   displaySearchResults(searchResultsArr, searchTerm);
  // });

  $.ajax({
      url: requestURL,
      jsonp: "callback",
      dataType: "jsonp",
      success: function(data) {
          //Grab the required stuff from the resultant data object.
          let responseObj = data.query.pages;
          let searchResultsArr = [];

          //Create an array with the search results --- format : [[searchIndex, {searchResultObj}],[,{}],...]
          //This shall help us sort the results according to their search index value as returned by the wiki api
          $.each(responseObj, function(key, val){
            let title = val.title;
            let titleExtractPairObj = {};
            titleExtractPairObj[title] = val.extract
            searchResultsArr.push([val['index'], titleExtractPairObj]);
          });

          //Sort the search results by their search result index
          searchResultsArr.sort(function(a,b){
            return a[0] - b[0];
          });

          //Display Search Results
          displaySearchResults(searchResultsArr, searchTerm);

        }
      });

}

function displaySearchTermSuggestions(suggestionTermsArr){
  //Clear all child suggestions before populating the suggestions list...
  $(".search-term-suggestions-list").empty();

  //...and then populate the list of suggestions
  $.each(suggestionTermsArr, function(index, val){
    $('.search-term-suggestions-list').append("<li class=\"suggestion-item\">"+ val +"</li>");
  });
}

function displaySearchResults(searchResultsArr,searchTerm){

  totalSearchResults = searchResultsArr.length;
  $('.search-results-container').prepend('<p>Showing <span class=\"total-results\">' + totalSearchResults + '</span> results for <span class=\"search-term\">\"' + searchTerm + '\"</span></p>');
  $.each(searchResultsArr,function(index, value){
    let resultTitle = Object.keys(value[1]);
    let resultExtract = Object.values(value[1]);

    $('.search-results-list').append('<li class=\"search-result-item\"><h1 class=\"search-result-title\">' + resultTitle + '</h1><p class=\"search-result-extract\">' + resultExtract + '</p><div class=\"redirect-icon\"></div></li>');
  });
}

function openWikiLink(wikiSearchParam){
  let requestUrl = "https://en.wikipedia.org/wiki/" + wikiSearchParam;
  window.open(requestUrl);
}

function getElementTotalVerticalHeight(className){
  let totalElementHeight = parseInt($(className).height()) + parseInt($(className).css('margin-bottom')) + parseInt($(className).css('margin-top')) + parseInt($(className).css('padding-top')) + parseInt($(className).css('padding-bottom'));
  return totalElementHeight;

}

function slideTopSectionUp(){
      $('.top-section').css({
        'transition' : 'all 0.3s ease-in-out',
        'transform' : 'translate(0px,0px)'
      });

      $('.search-field > span').addClass('fadeOut');
}

function showSuggestionsContainer(){
  $('.suggestions-container').css({
    'display' : 'block'
    });
  suggestionsContainerHidden = false;
}

function slideTopSectionDown(){
  $('.top-section').css({
    'transform' : 'translate(0px, '+ translateYValue +'px)'
  });

  $('.search-field > span').removeClass('fadeOut')
  suggestionsContainerHidden = true;
}



//  ============================
//  DOCUMENT.READY() STARTS HERE
//  ============================

$(document).ready(function(){

  //The input field is focussed by default
  $('#myInputField').focus();


  //This info is needed to vertically center the top container initially
  //
  //Compute vertical height of search bar and logo container
  let searchBarVerticalHeight = getElementTotalVerticalHeight('.search-bar-container');
  let logoContainerVerticalHeight = getElementTotalVerticalHeight('.logo-container');
  let topHeight = searchBarVerticalHeight + logoContainerVerticalHeight;

  let viewPortHeight = $(window).height();
  translateYValue = 0.5*(viewPortHeight - topHeight);

  $('.top-section').css({
    'transform' : 'translate(0px, '+ translateYValue +'px)'
  });


  //
  //??? Is this required ???
  //On the search results screen,
  //If the user clicks on the search input field,
  //clear the search results and show suggestions for the search term
  //in the input field.
  $('#myInputField').focus(function(){
    $('.search-results-list').empty();
    $('.search-results-list').siblings().remove();
    fetchSearchTermSuggestions($(this).val());
  });
  //


  //Adding keyboard shortcut - pressing escape clears the search field
  //If escape pressed on an empty text field - system goes to initial state.
  $('#myInputField').keydown(function(e){
    if(e.originalEvent.key === 'Escape'){
      if($(this).val()===''){
        slideTopSectionDown();
      } else {
        $('.search-term-suggestions-list').empty();
        $(this).val('');
      }
    }
  });

  $("#myInputField").keypress(function(){
    slideTopSectionUp();
    if(suggestionsContainerHidden){
      setTimeout(showSuggestionsContainer, 200);
    }
  });

  $("#myInputField").click(function(){
    slideTopSectionUp();
    if(suggestionsContainerHidden){
      setTimeout(showSuggestionsContainer, 200);
    }
  });


  //
  //
  //

  //Listen for keyboard event on the input text field - this is important as we intend to keep changing the list suggestions dynamically as the user types his/her search query.
  $("#myInputField").keyup(function(event){

    // $('.search-results-list').empty(); //Clear out the previously populated suggestion items
    // $('.search-results-list').siblings().remove();
    //
    // $('.search-term-suggestions-list').empty(); //Clear out the previously populated suggestion items
    // $('.search-term-suggestions-list').siblings().remove();

    let inputFieldVal = $("#myInputField").val();

    if(event.originalEvent.key === "Enter"){
      $('.search-term-suggestions-list').empty();
      fetchSearchResults(inputFieldVal);  //If the user hits enter, return search results
    } else {
      fetchSearchTermSuggestions(inputFieldVal); //else, keep listing suggestions based on what he/she is typing.
    }
  });

  //When the mouse enters a list-suggestion item, everything else should fade out. Give its siblings a particular class.
  $(document).on("mouseenter",".suggestion-item", function(){
    $(this).addClass('focusItem');
    $(this).siblings().addClass('blurItem');
  });

  //When mouse leaves a list-suggestion item, everything should return to normalcy. Remove the previously associated class.
  $(document).on("mouseleave", ".suggestion-item", function(){
    $(this).removeClass('focusItem');
    $(this).siblings().removeClass('blurItem');
  });

   //When user clicks on this list-suggestion, run a wiki search on it.
  $(document).on("click", ".suggestion-item", function(){
      let searchTerm = $(this).text();
      $('#myInputField').val(searchTerm);
      $('.search-term-suggestions-list').empty();
      // console.log('I just clicked');
      fetchSearchResults(searchTerm);
  });

  //When mouse enters a search result item : change its state to indicate focus
  $(document).on("mouseenter",".search-results-list > li", function(){
    $(this).addClass('focus-search-result');
    $(this).siblings().addClass('blur-search-result');
  });

  //When mouse leaves the item, revert back to original state
  $(document).on("mouseleave",".search-results-list > li", function(){
    $(this).removeClass('focus-search-result');
    $(this).siblings().removeClass('blur-search-result');
  });

  //On clicking on the search result item - open the link in a new window
  $(document).on("click",".search-results-list > li", function(){
    let wikiSearchParam = $(this).find('.search-result-title').text().split(" ").join("_"); //Format the search result title into wiki search url parameter
    openWikiLink(wikiSearchParam);  //Open link
  });

  $('.random-article-button').click(function(){
    let randomWikiSearchParam = 'Special:Random';
    openWikiLink(randomWikiSearchParam);
  });
});
