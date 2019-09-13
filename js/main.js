const apiKey = config.API_KEY;
const netflix_path = config.NETFLIX_PHOTO;
var searching = false;
var running = false;
let output = "";
var whatMovies = [];
var pageN = 1;
var pageS = 1;
let genreList = [];
let movieList = [];

//            ----------------            Get Now Playing           ----------------

function getNowPlayingList(page) {
  var text = "Now playing in theaters...";
  searching = false;
  console.log(page);
  console.log("Movies now playing");
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=${page}`;
  fetch(url)
    .then(data => {
      return data.json();
    })
    .then(res => {
      movieList.push(res.results);
      getMovies(res.results);
      setHTML(text, "#movieList-header");
    })
    .catch(err => console.log(err));
}

//            ------------            Get Genre List           ----------------
async function getGenreList() {
  const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;
  let data = await fetch(genreUrl);
  let res = await data.json();
  return res;
}
getGenreList()
  .then(res => {
    genreList = res.genres;
    return genreList;
  })
  .catch(err => console.log(err));

//            ------------            Search           ----------------
function search(page) {
  console.log(page);
  searching = true;
  var text = "Movie List";
  console.log("Searching Movies");
  let searchInputValue = document.getElementById("searchInput").value;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchInputValue}&page=${page}`;
  fetch(url)
    .then(data => {
      return data.json();
    })
    .then(res => {
      // console.log(res.results);
      getMovies(res.results);
      setHTML(text, "#movieList-header");
    })
    .catch(err => console.log(err));
}

//            ------------            Set Title           ----------------
function setHTML(output, idtag) {
  $(idtag).html(output);
}
//            ------------            Function() Get Movies         ----------------
//get the res.result from the first fetch as whatMovies =[ ... ]
function getMovies(whatMovies) {
  $.each(whatMovies, (index, movie) => {
    output += `
    <div id='movie-card' onclick='movieSelected("${movie.id}")'>
      <div id='movie-card-item'>
        <div class="background-image" style="background-image: url('http://image.tmdb.org/t/p/w500/${
          movie.poster_path != null ? movie.poster_path : netflix_path
        }"/> 
        <div id="movie-card-content" >
          <h3 id='movie-card-header'>${movie.original_title}</h3>
          <div>Release Date: ${movie.release_date}</div>
          <div>Genre(s): ${genreIdFunc(movie.genre_ids)} </div>
          <h3>Overview:</h3>
          <p class="pjustify">${movie.overview}</p>
          <div class="both">
            <p class="movie-star"><i class="fa fa-star" aria-hidden="true"></i> ${
              movie.vote_average
            } </p>
            <p class="movie-users"><i class="fas fa-users"></i> ${
              movie.vote_count
            }</p>
          </div>
        </div>
      </div>
    </div>
       `;
  });
  setHTML(output, "#movies");
}

//            ------------           Function Genre From Id to Names            ----------------
function genreIdFunc(genreId) {
  movieObjGenres = movieList.map(k => genreId);
  const moviesCardGenres = movieObjGenres[0];
  return genreList
    .filter(g => moviesCardGenres.includes(g.id))
    .map(g => g.name)
    .join(", ");
}

function movieSelected(id) {
  sessionStorage.setItem("movieId", id);
  openModal();
  getSingleMovie();
}

//            ------------            Get Single Movie           ----------------
function getSingleMovie() {
  let output = "";
  let sim_output = "";

  console.log("Get a Single Movie");
  setHTML("", "#review-content");

  let movieId = sessionStorage.getItem("movieId");

  //            ----------------            Fetch Videos Trailer          ----------------
  const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`;
  fetch(url)
    .then(data => {
      return data.json();
    })
    .then(res => {
      videoFunc(res.results[0]);
    })
    .catch(err => console.log(err));

  //            ----------------            Function() to show Video           ----------------

  function videoFunc(video) {
    if (typeof video == "undefined") {
      var output = `<h2 class="single-header pacifico">We are sorry, Trailer is not available...</h2>`;
    } else {
      var output = `
        <div class='video-card' >
          <iframe class="youtube-video" width="640" height="360"  src="https://www.youtube.com/embed/${video.key}?enablejsapi=1&version=3&playerapiid=ytplayer" frameborder="0" allowfullscreen></iframe>
        </div>`;
    }
    setHTML(output, "#modal-text");
  }

  //            ----------------           Fetch Reviews           ----------------
  urlReview = ` https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${apiKey}&language=en-US&page=1`;
  fetch(urlReview)
    .then(data => {
      return data.json();
    })
    .then(res => {
      reviewsFunc(res.results);
    })
    .catch(err => console.log(err));

  //            ----------------            Function() to Get Reviews           ----------------

  function reviewsFunc(reviews) {
    count = 0;
    gac = 1;
    $.each(reviews, (index, rev) => {
      count = count + 1;
      if (index == 0 || index == 1) {
        displ = "block";
      } else {
        displ = "none";
      }
      output += `
      <div class='review-card' style='display:${displ}'>
        <p class='review-p'>${rev.content}</p>
        <h5><span class="mute"> Author: </span>${FLcapital(rev.author)}</h5>
      </div>
      `;
    });

    if (count > 0) {
      $("#review-header").css("display", "visible");
    }
    setHTML(output, "#review-content");
  }

  //            ----------------            Fetch Similar Movies           ----------------
  urlSimilar = `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${apiKey}&language=en-US&page=1`;
  fetch(urlSimilar)
    .then(data => {
      return data.json();
    })
    .then(res => {
      similarMovies(res.results);
    });
  //            ----------------            Function() Similar Movies           ----------------
  function similarMovies(results) {
    simoviesHeader = "Movies you may like..";
    // var count = 0;
    $.each(results, (index, similarMovie) => {
      sim_output += `
        <div id='simovie-card'>
          <div id="simovie-card-content" onclick='movieSelected("${
            similarMovie.id
          }"); topFunction(".modal-content");'>
            <img src="http://image.tmdb.org/t/p/w500/${
              similarMovie.poster_path != null
                ? similarMovie.poster_path
                : netflix_path
            }" alt="No image found."/>
          </div>
        </div>`;
    });
    setHTML(sim_output, "#simovie-grid");
  }
}

var modal = document.getElementById("simpleModal");
var closeBtn = document.getElementById("closeBtn");

function openModal() {
  $("#modal").show();
}
//            ----------------            Exit modal           ----------------
$("#closeBtn").on("click", function() {
  $("#modal").hide();
  //Stop youtube video from playing in the background
  $(".youtube-video")[0].contentWindow.postMessage(
    '{"event":"command","func":"' + "stopVideo" + '","args":""}',
    "*"
  );
});
$(document).mouseup(function(e) {
  let container = $(".modal-content");
  if (!container.is(e.target) && container.has(e.target).length === 0) {
    container.parent().hide();
  }
});

$(document).keyup(function(e) {
  if (event.keyCode === 13) {
    console.log("ENTER");
    event.preventDefault();
    pageN = 1;
    document.getElementById("searchBtn").click();
  }
});

// window.ONLOAD
window.onload = function() {
  var page = 1;
  getNowPlayingList(page);
  var searchInput = document.getElementById("searchInput");
  searchInput.focus();

  $("#searchBtn").on("click", () => {
    output = "";
    let idtag = "#movies";
    if (!searchInput.value) {
      setHTML(output, idtag);
      getNowPlayingList(page);
    } else {
      search(page);
    }
    searchInput.focus();
  });
};

// BUTTON (  TOP  )
topbutton = document.getElementById("myBtn");
$("#myBtn").on("click", () => topFunction("html, body"));

//Scroll To the Top
function topFunction(html) {
  $(html).animate({ scrollTop: 0 }, "slow");
}
// Infinite Scroll Function
window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 1000 ||
    document.documentElement.scrollTop > 1000
  ) {
    topbutton.style.display = "block";
  } else {
    topbutton.style.display = "none";
  }
}

// Infinite scrolling.
$(window).scroll(function() {
  if ($(this).scrollTop() + 100 >= $("body").height() - $(window).height()) {
    if (running == false) {
      running = true;
      //   HERE
      if (searching == true) {
        searching = true;
        pageS = pageS + 1;
        search(pageS);
      } else {
        pageN = pageN + 1;
        getNowPlayingList(pageN);
      }
    }
    setTimeout(function() {
      running = false;
    }, 300);
  }
});

//Capitalize commentators
function FLcapital(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
