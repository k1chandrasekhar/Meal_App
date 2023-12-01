// Check if 'favouritesList' exists in local storage; if not, initialize it as an empty array
// it makes a favourites meal array if it's not exist in local storage
if (localStorage.getItem("favouritesList") == null) {
  localStorage.setItem("favouritesList", JSON.stringify([]));
}

// Async function to fetch meals from the API based on the provided URL and search value
// it fetches meals from api and return it
async function fetchMealsFromApi(url, value) {
  const response = await fetch(`${url + value}`);
  const meals = await response.json();
  return meals;
}

// Function to display meals based on the search input value
// it shows all meals card in main according to search input value
function showMealList() {
  // Get search input value
  let inputValue = document.getElementById("my-search").value;
  // Retrieve favorites list from local storage
  let arr = JSON.parse(localStorage.getItem("favouritesList"));
  // API URL for meal search
  let url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
  // HTML string to display meals
  let html = "";
  // Fetch meals from the API
  let meals = fetchMealsFromApi(url, inputValue);
  meals.then((data) => {
    if (data.meals) {
      // Loop through each meal in the response and create meal cards
      data.meals.forEach((element) => {
        let isFav = arr.includes(element.idMeal);
        html += createMealCard(element, isFav);
      });
    } else {
      // Display a message if no results are found
      html += `<p>No Meals found.</p>`;
    }
    // Update the 'main' container with the generated HTML
    document.getElementById("main").innerHTML = html;
  });
}

// Async function to display full meal details in the 'main' container
// it shows full meal details in main
async function showMealDetails(id) {
  let url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
  let html = "";

  // Fetch meal details from the API
  await fetchMealsFromApi(url, id).then((data) => {
    // Generate HTML for displaying meal details
    html += `
      <div id="meal-details" class="mb-5">
          <div id="meal-header" class="d-flex justify-content-around flex-wrap">
              <div id="meal-thumbail">
                  <img class="mb-2" src="${data.meals[0].strMealThumb}" alt="" srcset="">
              </div>
              <div id="details">
                  <h3>${data.meals[0].strMeal}</h3>
                  <h6>Category : ${data.meals[0].strCategory}</h6>
                  <h6>Area : ${data.meals[0].strArea}</h6>
              </div>
          </div>
          <div id="meal-instruction" class="mt-3">
              <h5 class="text-center">Instruction :</h5>
              <p>${data.meals[0].strInstructions}</p>
          </div>
          
          <div class="text-center">
              <a href="${data.meals[0].strYoutube}" target="_blank" class="btn btn-danger mt-3">Watch Video</a>
          </div>

      </div>
      `;
  });
  // Update the 'main' container with the generated HTML
  document.getElementById("main").innerHTML = html;
}

// Function to add or remove meals from the favorites list
// Updated function to add and remove meals from favorites list
function addRemoveToFavList(id) {
  // Retrieve favorites list from local storage
  let arr = JSON.parse(localStorage.getItem("favouritesList"));

  // Check if the meal is already in the favorites list
  let contain = arr.includes(id);

  if (contain) {
    // If meal is in favorites, remove it
    arr = arr.filter((itemId) => itemId !== id);
    showToast("Your meal removed from your favourites list");
  } else {
    // If meal is not in favorites, add it
    arr.push(id);
    showToast("Your meal added to your favourites list");
  }

  // Update the 'favouritesList' in local storage
  localStorage.setItem("favouritesList", JSON.stringify(arr));

  // Update the displayed meal list and favorites list
  showMealList();
  showFavMealList();

  // Toggle button color based on whether the meal is in favorites or not
  // Change button color after adding/removing from favorites
  const favoriteButton = document.getElementById(`main${id}`);
  if (favoriteButton) {
    favoriteButton.classList.toggle("clicked");
  }

  // Set a timeout to remove the toast after 1 second
  setTimeout(() => {
    const toast = document.querySelector(".toast");
    if (toast) {
      toast.remove();
    }
  }, 1000);
}

// Function to show a toast notification
function showToast(message) {
  // Create a new toast element
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<div class="toast-body">${message}</div>`;

  // Append the toast to the body
  document.body.appendChild(toast);

  // Bootstrap's Toast initialization
  const bootstrapToast = new bootstrap.Toast(toast);

  // Show the toast
  bootstrapToast.show();

  // Remove the toast after it's hidden
  toast.addEventListener("hidden.bs.toast", () => {
    document.body.removeChild(toast);
  });
}

// Async function to display all favorite meals in the 'favourites-body' container
// it shows all favourites meals in favourites body
async function showFavMealList() {
  let arr = JSON.parse(localStorage.getItem("favouritesList"));
  let url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
  let html = "";
  if (arr.length === 0) {
    // Display a message if no meals are added to favorites
    html += `<p>Meals added to favourites will be shown here.</p>`;
  } else {
    // Loop through each meal in the favorites list and create meal cards
    for (let id of arr) {
      await fetchMealsFromApi(url, id).then((data) => {
        html += createMealCard(data.meals[0], true);
      });
    }
  }

  // Update the 'favourites-body' container with the generated HTML
  document.getElementById("favourites-body").innerHTML = html;
}

// Function to create HTML for a meal card
// it creates HTML for a meal card
function createMealCard(element, isFav) {
  return `
  <div id="card" class="card mb-3" style="width: 20rem;">
    <img src="${element.strMealThumb}" class="card-img-top" alt="...">
    <div class="card-body">
        <h5 class="card-title">${element.strMeal}</h5>
        <div class="d-flex justify-content-between mt-5">
            <button type="button" class="btn btn-outline-light" onclick="showMealDetails(${
              element.idMeal
            })">More Details</button>
            <button id="main${
              element.idMeal
            }" class="btn btn-outline-light favorite-btn ${
    isFav ? "active" : ""
  }" onclick="addRemoveToFavList(${element.idMeal})" style="border-radius:50%">
                <i class="fa-solid fa-heart"></i>
            </button>
        </div>
    </div>
</div>

  `;
}
