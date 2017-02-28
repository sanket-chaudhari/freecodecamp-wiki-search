function fetchSearchTermSuggestions(searchTerm){

  //generate requestURL
  let requestURL = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="+searchTerm+"&utf8=1";

  //fetch and display data
  $.getJSON(requestURL, function(data){
    //console.log(data);
    let suggestionTermsArr = data[1];
    displaySearchTermSuggestions(suggestionTermsArr);

  });
}

function fetchSearchResults(searchTerm){
  //generate request URL
  let requestURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch="+searchTerm;

  //Fetch response as a JSON object
  $.getJSON(requestURL, function(data){

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
    displaySearchResults(searchResultsArr);
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

function displaySearchResults(searchResultsArr){
  $.each(searchResultsArr,function(index, value){
    let resultTitle = Object.keys(value[1]);
    let resultExtract = Object.values(value[1]);

    $('.search-results-list').append('<li><h1 class=\"search-result-title\">' + resultTitle + '</h1><p class=\"search-result-extract\">' + resultExtract + '</p></li>');
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


$(document).ready(function(){

  //This info is needed to vertically center the top container initially
  //
  //Compute vertical height of search bar and logo container
  let searchBarVerticalHeight = getElementTotalVerticalHeight('.search-bar-container');
  let logoContainerVerticalHeight = getElementTotalVerticalHeight('.logo-container');
  let topHeight = searchBarVerticalHeight + logoContainerVerticalHeight;

  let viewPortHeight = $(window).height();
  let translateYValue = 0.5*(viewPortHeight - topHeight);

  $('.top-section').css({
    'transform' : 'translate(0px, '+ translateYValue +'px)'
  });
  //
  //
  //


  $('#myInputField').focus(function(){
    $('.search-results-list').empty();
    fetchSearchTermSuggestions($(this).val());
  });

  //Listen for keyboard event on the input text field - this is important as we intend to keep changing the list suggestions dynamically as the user types his/her search query.
  $("#myInputField").keyup(function(event){

    $('.search-results-list').empty(); //Clear out the previously populated suggestion items

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
    $(this).siblings().addClass('blur');
  });

  //When mouse leaves a list-suggestion item, everything should return to normalcy. Remove the previously associated class.
  $(document).on("mouseleave", ".suggestion-item", function(){
    $(this).siblings().removeClass('blur');
  });

   //When user clicks on this list-suggestion, run a wiki search on it.
  $(document).on("click", ".suggestion-item", function(){
      let searchTerm = $(this).text();
      $('.search-term-suggestions-list').empty();
      // console.log('I just clicked');
      fetchSearchResults(searchTerm);
  });

  //When mouse enters a search result item : change its state to indicate focus
  $(document).on("mouseenter",".search-results-list > li", function(){
    $(this).addClass('blue-border');
    $(this).siblings().addClass('blur');
  });

  //When mouse leaves the item, revert back to original state
  $(document).on("mouseleave",".search-results-list > li", function(){
    $(this).removeClass('blue-border');
    $(this).siblings().removeClass('blur');
  });

  //On clicking on the search result item - open the link in a new window
  $(document).on("click",".search-results-list > li", function(){
    let wikiSearchParam = $(this).find('.search-result-title').text().split(" ").join("_"); //Format the search result title into wiki search url parameter
    openWikiLink(wikiSearchParam);  //Open link
  });

});
