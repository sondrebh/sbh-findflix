//Home.js by SBH

//navbar

let filterIsOpen = false;
$(".navIcon").click(()=>{
    $(".filterDropdown").toggleClass("filterDown");
    $(".fa-sliders-h").toggleClass("fa-times");
    filterIsOpen = !filterIsOpen;
}); 

$("#clickListener").on("click", ()=>{
    if(filterIsOpen) {
        $(".filterDropdown").toggleClass("filterDown");
        $(".fa-sliders-h").toggleClass("fa-times");
        filterIsOpen = !filterIsOpen;
    }
});

$(".bModalBackground").click(function(){
    $(this).toggleClass("showModal");
});

//default values for filter
let currentPage = 0;
let imdbMin = "0";
let imdbMax = "10";
let genrePub = "";
let sortPub = 0;
let minYear = "1900";
let maxYear = "2019";
let agePub = "";

let isOnInfoPage = false;


$(".infoPage").css("display", "none");

$(".navItem:nth-child(1)").click(()=>{
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    pageHandler(0);
    isOnInfoPage = false;
    $(".cont2").css("display", "inline-block");
    $(".infoPage").css("display", "none");
    if(w <= 520) {
        $("#filterContent").css("display","inline");
    } else {
        $(".navIcon").css("display","inline-block");
    }
});

$(".navItem:nth-child(2)").click(()=>{
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    pageHandler(1);
    isOnInfoPage = false;
    $(".cont2").css("display", "inline-block");
    $(".infoPage").css("display", "none");
    if(w <= 520) {
        $("#filterContent").css("display","inline");
    } else {
        $(".navIcon").css("display","inline-block");
    }
});

$(".navItem:nth-child(3)").click(()=>{
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    pageHandler(2);
    $(".pageContent").empty();
    isOnInfoPage = true;
    $(".cont2").css("display", "none");
    $(".infoPage").css("display", "inline-block");
    if(w <= 520) {
        $("#filterContent").css("display","none");
    } else {
        $(".navIcon").css("display","none");
    }
});

function pageHandler(id) {
    currentPage = id;
    $(".navItem").removeClass("navItemActive");
    $(".navItem:nth-child(" + (id+1) + ")").addClass("navItemActive");
    if(currentPage !== 2) {
        filter(currentPage, imdbMin, imdbMax, genrePub, sortPub, minYear, maxYear, agePub);
    }
    
    if(filterIsOpen) {
        $(".filterDropdown").toggleClass("filterDown");
        $(".fa-sliders-h").toggleClass("fa-times");
        filterIsOpen = !filterIsOpen;
    }
}

$('#select-sjanger').selectize({
    create: false,
    //maxItems: 3,
    onChange: values=>{
        genrePub = values;
        filter(currentPage, imdbMin, imdbMax, genrePub, sortPub, minYear, maxYear, agePub);
    },
    sortField: 'text'
});

$('#select-sorter').selectize({
    create: false,
    onChange: values=>{
        sortPub = values;
        filter(currentPage, imdbMin, imdbMax, genrePub, sortPub, minYear, maxYear, agePub);
    },
    sortField: 'text'
});

$('#select-age').selectize({
    create: false,
    onChange: values=>{
        agePub = values;
        filter(currentPage, imdbMin, imdbMax, genrePub, sortPub, minYear, maxYear, agePub);
    },
    sortField: 'text'
});

let slider = document.getElementById('slider');

let sliderYear = document.getElementById('sliderYear');

noUiSlider.create(slider, {
    start: [0, 10],
    tooltips: true,
    connect: true,
    range: {
        'min': 0,
        'max': 10
    },
    ariaFormat: wNumb({
        decimals: 1
    }),
    format: wNumb({
        decimals: 1
    })
});

noUiSlider.create(sliderYear, {
    start: [1900, 2019],
    tooltips: true,
    connect: true,
    range: {
        'min': 1900,
        'max': 2019
    },
    ariaFormat: wNumb({
        decimals: 0
    }),
    format: wNumb({
        decimals: 0
    })
});

slider.noUiSlider.on("update", values=>{
    let y = values[0].replace(".0", "");
    let x = values[1].replace(".0", "");
    $(".imdbLive").html(y + " - " + x);
});

sliderYear.noUiSlider.on("update", values=>{
    $(".utgivelse").html(values[0] + " - " + values[1]);
});

slider.noUiSlider.on("change", values=>{
    imdbMin = values[0];
    imdbMax = values[1];
    filter(currentPage, imdbMin, imdbMax, genrePub, sortPub, minYear, maxYear, agePub);
});

sliderYear.noUiSlider.on("change", values=>{
    minYear = values[0];
    maxYear = values[1];
    filter(currentPage, imdbMin, imdbMax, genrePub, sortPub, minYear, maxYear, agePub);
});

let movies = [];
let shows = [];
let filteredItems = [];
let movieCount = 0;
let lastUpdate;

function parseDate(input) {
    var parts = input.match(/(\d+)/g);
    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
}

//onload
$.get("/db", data=>{
    movies = data.movies;
    shows = data.shows;
    filter(currentPage, imdbMin, imdbMax, genrePub, sortPub, minYear, maxYear, agePub);

    lastUpdate = new Date(data.lastUpdate);
    let newVal = new Date();

    let diff = Math.abs(lastUpdate.getTime() - newVal.getTime());
    let minutes = Math.floor((diff/1000)/60);

    $("#statMin").text(minutes);
    $("#statFilmT").text(data.availableMovies);
    $("#statSerieT").text(data.availableShows);
    $("#statFilmerL").text(data.changeMovies);
    $("#statSerierL").text(data.changeShows);
});

$(document).ready(()=>{
    $("#select-sjanger-selectized").attr("readonly", "true");
    $("#select-sorter-selectized").attr("readonly", "true");
    $("#select-age-selectized").attr("readonly", "true");
});

$(window).scroll(function () {
    if(!isOnInfoPage) {
        if($(document).height() - $(this).height() <= $(this).scrollTop()+100){
            displayItems(1);
        }
    }
}); 

async function displayItems(id) {
    if(id !== 1) {
        movieCount = 0;
        $(".pageContent").empty();
    }
    for(let i = 0; i < 30; i++) {
        let waiter = new Promise(resolve=>{
            $(".pageContent").append('<div onclick="enlargeImage(' + movieCount + ')" class="imgContainer"><div class="imgOverlay"></div><img id="item' + movieCount + '" src="' + filteredItems[movieCount].Poster + '" alt="poster" height="" width="" class="pageItem"></img><p class="foundTitle">'+ filteredItems[movieCount].Title +'</p><p class="foundImdb">'+ filteredItems[movieCount].imdbRating +'</p><p class="foundYear">'+ filteredItems[movieCount].Year +'</p></div>');
            if($("#item"+movieCount).attr("src") === "N/A" || $("#item"+movieCount).attr("src") === "https://images-na.ssl-images-amazon.com/images/M/MV5BNDZhMzk3ODYtMjQ5YS00MDYwLWFlOGEtOGY3ZjhmNGQwZGNmXkEyXkFqcGdeQXVyNjMxNjI4MzI@._V1_SX300.jpg") {
                $("#item"+movieCount).attr("src", "/findflix/images/error.png")
                resolve();
            }
            resolve();
        });
        waiter.then(movieCount++);
    }
    if(filteredItems.length === 0) {
        $(".pageContent").empty();
        $(".pageContent").append('<p style="color: #d6d6d6 !important;">Fant ingen filmer eller serier som matcher ditt søk...</p>');
    }

    $(".loaderContainer").addClass("hideLoader");
}

function enlargeImage(id) {
    $(".bModalBackground").toggleClass("showModal");
    $(".bModalItemContainer").attr("src", filteredItems[id].Poster);

    if($(".bModalItemContainer").attr("src") === "N/A") {
        $(".bModalItemContainer").attr("src", "/findflix/images/error.png")
    }


    $(".bTitle").html(filteredItems[id].Title);
    $(".bUnderline:nth-of-type(2)").html(filteredItems[id].Genre + " / ");
    $(".bUnderline:nth-of-type(3)").html(filteredItems[id].Language + " / ");
    $(".bUnderline:nth-of-type(4)").html(filteredItems[id].Year + " / ");
    $(".bUnderline:nth-of-type(5)").html(filteredItems[id].Runtime);
    $(".bPlot").html(filteredItems[id].Plot);

    $(".bImdb").attr("href", "https://www.imdb.com/title/"+filteredItems[id].imdbID);
}

function filter(id, iMin, iMax, genre, sort, yearMin, yearMax, age) {
    return new Promise((resolve, reject) => {
    filteredItems = [];
    if(genre === "0") {
        genre = "";
    }
    if(age === "0") {
        age = "";
    }
    if(Number(id) === 0) {
        for(let i = 0; i < movies.length; i++) {
            if((String(movies[i].Rated).includes(String(age))) && (movies[i].imdbRating >= Number(iMin)) && (movies[i].Year >= yearMin) && (movies[i].imdbRating <= Number(iMax)) 
            && (movies[i].Year <= yearMax) && (String(movies[i].Genre).includes(String(genre)))) {
                filteredItems.push(movies[i]);
            }
        }
    } else if (Number(id) === 1) {
        for(let i = 0; i < shows.length; i++) {
            if((String(shows[i].Rated).includes(String(age))) && (shows[i].imdbRating >= Number(iMin)) && (shows[i].Year >= yearMin) && (shows[i].imdbRating <= Number(iMax)) 
            && (shows[i].Year <= yearMax) && (String(shows[i].Genre).includes(String(genre)))) {
                filteredItems.push(shows[i]);
            }
        }
    }
    if(sort == 0) {
        resolve();
        displayItems();
    } else if(sort == 2) {
        function compareIMDB(a,b) {
            if (a.imdbRating < b.imdbRating)
              return -1;
            if (a.imdbRating > b.imdbRating)
              return 1;
            return 0;
        }
        filteredItems.sort(compareIMDB);
        filteredItems.reverse();
        resolve();
        displayItems();   
    } else if(sort == 3) {
        function compareYear(a,b) {
            if (a.Year < b.Year)
              return -1;
            if (a.Year > b.Year)
              return 1;
            return 0;
        }
        filteredItems.sort(compareYear);
        filteredItems.reverse();
        resolve();
        displayItems();   
    } else if(sort == 4) {
        function compareRuntime(a,b) {
            if (a.Runtime < b.Runtime)
              return -1;
            if (a.Runtime> b.Runtime)
              return 1;
            return 0;
        }
        filteredItems.sort(compareRuntime);
        filteredItems.reverse();
        resolve();
        displayItems();   
    } else if(sort == 5) {
        
        resolve();
        displayItems();
    } else if(sort == 6) {
        
        resolve();
        displayItems();   
    } else if(sort == 7) {
       
        resolve();
        displayItems();   
    }
    });
}