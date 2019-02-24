
let reachedBottom = false;
let count = 0;
let locY = 0;
let lastScrollY = 0;
let movieArray = [];
const fetchMovies = function(){

    let movie = document.querySelectorAll(".boxart-container");
    let movieNameContainer = movie[count].parentElement;
    let movieName = movieNameContainer.getAttribute("aria-label");
    console.log(movieName);
    movieArray.push(movieName);

    locY += 40;
    window.scrollTo(0, locY);
    count++;

    if(lastScrollY == window.scrollY){
        return "we reached the bottom";
    }

    lastScrollY = window.scrollY;
    setTimeout(fetchMovies, 40);
}

fetchMovies();































