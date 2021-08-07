// Global Page Elements
const menuBtn = $('#dropBtn')
const dropDownMenu = document.querySelector('.dropdown-content')
const historyBox = $('.history-wrapper');
//tags variable for word cloud
var myTags = [
  'JavaScript', 'CSS', 'HTML',
  'Angualr', 'VueJS', 'React',
  'Python', 'Go', 'Chrome',
  'Edge', 'Firefox', 'Safari',
];

// Global Variables
var lastSearch = [];

// Landing Page Elements
const findRecipeBtn = $('#land-find-recipe-btn')
const leadEl = $('#lead');

// Main Page Elements
const mainSrchBtn = $('#main-search-btn')
const mainSrchInput = $('#main-search-input')

// Spoonacular API Key
const spoonApiKey = "0dd309d8ae284120be54a47af108d02c";

// Object to construct Spoonacular Urls
var spoonacularUrls = {
  // Known base Urls for various API calls
  apiUrl: "https://api.spoonacular.com/",
  jokeRequest: "food/jokes/random",
  triviaRequest: "food/trivia/random",
  randomRecipesRequest: "recipes/random",
  findByIngredientsRequest: "recipes/findByIngredients",

  // Create base url request with api key and optional parameters string
  constructBaseUrl: function (url, paramsString="") {
    var baseUrl = this.apiUrl;
    
    baseUrl += url;
    baseUrl += `?apiKey=${spoonApiKey}`
    baseUrl += paramsString;

    return baseUrl;
  },

  // Create Request Url for find recipe by ingredients
  findByIngredients: function (ingredients, numberOfRecipes=10, ignorePantry=true) {
    let count = 0;
    let baseUrl = this.constructBaseUrl(this.findByIngredientsRequest)

    // Add parameters for findByIngredient
    ingredients.forEach(item => {

      if (count == 0) {
        baseUrl += `&ingredients=${item}`;
      } else {
        baseUrl += `,+${item}`;
      }
      count++;
    })

    if (numberOfRecipes !== 10) {
      baseUrl += `&numberOfRecipes=${numberOfRecipes}`;
    }

    if (!ignorePantry) {
      baseUrl += `&ignorePantry=${ignorePantry}`
    }
    
    return baseUrl;
  },
}

// Add Joke of the Day
function addJoke() {
  const jokeEl = $('<p>').addClass('joke h3 text-center');
  const jokeRequest = spoonacularUrls.jokeRequest;
  const jokeRequestUrl = spoonacularUrls.constructBaseUrl(jokeRequest) ;

  apiCall(jokeRequestUrl).then((data) => {
    var jokeObject = data;
    jokeEl.text(jokeObject.text)
  });

  jokeEl.insertBefore(leadEl)
}

// Search By Ingredients
function searchByIngredients() {
  let ingredientsArray = mainSrchInput.val().replace(/\s/g,'').split(',');
  let baseUrl = spoonacularUrls.findByIngredients(ingredientsArray);

  //sets local storage to the most recent search
  localStorage.setItem('srchHistory', ingredientsArray)


  apiCall(baseUrl);
}

// Save last search from Landing Page in localStorage
function saveSearchInput(searchInput) {
  let ingredientSearchArray = searchInput.replace(/\s/g,'').split(',')
    
  try {
    localStorage.setItem('lastSearch', JSON.stringify(ingredientSearchArray));
  } catch (error) {
    console.log(error)
  }
}

// Redirect to Main Page with 
function redirectUrlWithParameters(searchInput) {
  let mainUrl = "./assets/main.html";
  let params = `?ingredients=${searchInput.replace(/\s/g,'')}`;
  let targetUrl = mainUrl + params;

  window.location.href = targetUrl;
  
  return targetUrl;
}

// Poplulate Main Search input with localstorage
function populateMainSearch() {
  let lastSearch = JSON.parse(localStorage.getItem('lastSearch'))
  $('#main-search-input').val(lastSearch.join(', '))
  return lastSearch;
}

// Create full request url w/optional additional parameters for a Spoonacular API call
function apiCall(baseUrl, params = {}) {
  let paramsString = ""

  // Add additional params if provided
  if (params != null) {
    for (let [key, value] of Object.entries(params)) {
      paramsString += `&${key}=${value}`;
    }
  };

  let requestUrl = baseUrl + paramsString;

  return fetch(requestUrl).then( function(response) {
    if (!response.status == 200) {
      // TODO: 404 Redirect
    }
    return response.json();
  
  }).then( function(data) {
    // TODO: Do something neat with data
    // OR pass data to new function to handle various API requests
    processSpoonacularData(data);
    return data;
  }).catch((err) => {
    console.log(err);
  });
}

function processSpoonacularData(data) {
  // TODO: Expand to handle various API calls
  console.log(data)
  
  return data;
}

function printDropMenu(){
  dropDownMenu.classList.toggle('show')
}
//function to redirect to main page
function goToMain() {
  let inputValue = $('#land-input').val()
  saveSearchInput(inputValue);
  redirectUrlWithParameters(inputValue);
}

// function to do a search by ingredients, and append the search terms to the history box
function searchAndSave(){
  searchByIngredients()
  printHistory()
}

//function to append search results
function printHistory(){
  //TODO: Add Function
    //appends searches to search history box
    let ingredientsArray = mainSrchInput.val().replace(/\s/g,'').split(',');
    historyBox.append(`<div id='history-card'><p>${ingredientsArray}</p></div>`)
    
}

historyBox.on('click', function(e){
  let clickValue = e.target.textContent
  searchByIngredients(clickValue)


})

// Added Button Event Listeners
menuBtn.on('click', printDropMenu)
mainSrchBtn && mainSrchBtn.on('click', searchAndSave);
findRecipeBtn && findRecipeBtn.on('click', goToMain)

// Add JOTD to landing page
if (window.location.pathname.endsWith('index.html')) {
  addJoke();
}

// Functions on switch to Main Page
if (window.location.pathname.includes('main.html')) {
  populateMainSearch();
  searchByIngredients();
}


