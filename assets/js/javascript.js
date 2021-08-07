//noticed foundation JS is throwing errors in the console, will add as an issue in github
// variable to target drop down menu button
var menuBtn = document.getElementById('dropBtn')

//console log to make sure targeting the right element
//console.log(menuBtn)

// variable to target the find recipe button
var searchBtn = document.getElementById('search')

//variable for a button that is specific to searching on the main page
var mainSrchBtn = document.querySelector('main-search')

//drop down menu content holder where items append to
var dropDownMenu = document.querySelector('.dropdown-content')

// Spoonacular API Key
const spoonApiKey = "";

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

// Landing Page Elements
const btnExpandedEl = $('.button');
const leadEl = $('.lead');

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

// Event listener for Landing page get ingredients button
btnExpandedEl.on('click', function() {
  const ingredientInputEl = $('#searchInput');
  let ingredientsArray = ingredientInputEl.val().split(',');
  let baseUrl = spoonacularUrls.findByIngredients(ingredientsArray);

  apiCall(baseUrl);
});

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
  localStorage.setItem('queryArray', JSON.stringify(data));
  recipeCardBuild(data);
  return data;
}

// Add JOTD to landing page
//addJoke();

function printDropMenu(){
  dropDownMenu.classList.toggle('show')
  console.log(dropDownMenu)
}
//function to redirect to main page
function goToMain(){
  window.location.href = "./assets/main.html"
}

//function to append search results
function printHistory(){

}

function loadEverything(){
  goToMain()
  apiCall()
}
//Rebuilder button for dev purposes (or to keep?)
$('#rebuildCards').click( function rebuildCards () {
  if ( localStorage.getItem('queryArray') != null) {
    savedData = JSON.parse(localStorage.getItem('queryArray'));
    recipeCardBuild(savedData);
  } else {
    console.log('No saved data');
  }
});
//Build cards when called
function recipeCardBuild (array) {
  $('.recipeCard').remove();
    array.forEach ((element,index,array) => {
      newRecipeCard = $('<div class="recipeCard" name="recipe '+element.id+'"></div>');
      newRecipeTitle = $('<h3 class="recipeTitle">'+element.title+'</h3>');
      newRecipeImage = $('<img class="recipeImage" src='+element.image+'>');
      newRecipeOl = $('<ol class="ingredientList" name="recipe '+element.id+'"></ol>');
      newRecipeCard.append(newRecipeTitle, newRecipeImage, newRecipeOl);
      element.usedIngredients.forEach((ele,i,arr) => {
        newRecipeIngUsed = $('<li class="usedIngredient" aisle="'+ele.aisle+'">'+ele.originalString+'</li>');
        newRecipeOl.append(newRecipeIngUsed);
      })
      element.missedIngredients.forEach((ele2,i2,arr2) => {
        newRecipeIngMiss = $('<li class="missIngredient" aisle="'+ele2.aisle+'">'+ele2.originalString+'</li>');
        newRecipeOl.append(newRecipeIngMiss);
      })
      $('#recipeContainer').append(newRecipeCard);
    })
}

//on click runs go to main, so when 'find recipes' button with id 'search' is clicked it re-directs to main content page

searchBtn && searchBtn.addEventListener('click', loadEverything)
mainSrchBtn && mainSrchBtn.addEventListener('click', apiCall)
menuBtn.addEventListener('click', printDropMenu)
