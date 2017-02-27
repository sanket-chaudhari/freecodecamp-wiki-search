function listSuggestions(searchTerm){

  //generate requestURL
  let requestURL = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="+searchTerm+"&utf8=1";

  //fetch and display data
  $.getJSON(requestURL, function(data){
    console.log(data);
    let suggestionsList = data[1];

    //Clear all child suggestions before populating the suggestions list...
    $("#list-suggestions").empty();

    //...and then populate the list of suggestions
    $.each(suggestionsList, function(index, val){
      $('#list-suggestions').append("<p>"+ val +"</p>");
    });

  });
}

function listSearchResults(searchTerm){
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
    console.log(searchResultsArr);
  });

}


$(document).ready(function(){

  $('#myInputField').focus();

  //Listen for keyboard event on the input text field - this is important as we intend to keep changing the list suggestions dynamically as the user types his/her search query.
  $("#myInputField").keyup(function(event){

      //console.log(event);
      let inputFieldVal = $("#myInputField").val();

      if(event.originalEvent.key === "Enter"){
        listSearchResults(inputFieldVal)  //If the user hits enter, return search results
      } else {
        listSuggestions(inputFieldVal); //else, keep listing suggestions based on what he/she is typing.
      }
    });

  //When the mouse enters a list-suggestion item, everything else should fade out. Give its siblings a particular class.
  $(document).on("mouseenter","p", function(){
    $(this).siblings().addClass('random');
  });

  //When mouse leaves a list-suggestion item, everything should return to normalcy. Remove the previously associated class.
  $(document).on("mouseleave", "p", function(){
    $(this).siblings().removeClass('random');
  });

   //When user clicks on this list-suggestion, run a wiki search on it.
  $(document).on("click", "p", function(){
      let searchTerm = $(this).text();
      // console.log('I just clicked');
      listSearchResults(searchTerm);
  });


});
