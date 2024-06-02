const dotenv = require("dotenv");

dotenv.config();

const OMDB_API_KEY = process.env.OMDB_API_KEY;

const axios = require("axios");

const User = require("../models/user.js");
const MovieList = require("../models/movieList.js");

const ITEMS_PER_PAGE = 6;

function getIndex(req, res, next) {
  if (req.user) {
    const myMovieListsIdObjs = req.user.myMovieLists;

    let myMovieListsId = [];
    let dataObj = {};

    if (myMovieListsIdObjs.length > 0) {
      for (const obj of myMovieListsIdObjs) {
        myMovieListsId.push(obj["movieListId"]);
      }
    }

    MovieList.find({ _id: { $in: myMovieListsId } })
      .then(async (movieLists) => {
        if (movieLists.length > 0) {
          const listPromises = movieLists.map(async (list) => {
            let contentMessage = false;
            const moviesData = [];

            if (list["movies"].length > 0) {
              contentMessage = true; // If there are movies, set contentMessage to true

              const requests = list["movies"].map((movie) => {
                return axios.get(`http://www.omdbapi.com/`, {
                  params: {
                    apikey: OMDB_API_KEY,
                    i: movie.movieId,
                  },
                });
              });

              const responses = await Promise.all(requests);

              responses.forEach((response) => {
                moviesData.push(response.data);
              });
            }

            dataObj[list._id.toString()] = {
              _id: list._id,
              title: list.title,
              status: list.status,
              description: list.description,
              movies: moviesData,
              contentMessage,
            };
          });

          await Promise.all(listPromises);
        }

        res.render("shop/index", {
          pageTitle: "Home",
          path: "/",
          movieLists: dataObj,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        next(err);
      });
  } else {
    res.render("shop/index", {
      movieLists: [],
      pageTitle: "Home",
      path: "/",
    });
  }
}

function postSearch(req, res, next) {
  const pageNo = +req.query.page || 1;
  const searchTerm = req.query.q;
  const ITEMS_PER_PAGE = 6;
  let totalProducts;

  axios
    .get(`http://www.omdbapi.com/`, {
      params: {
        apikey: OMDB_API_KEY,
        s: searchTerm,
      },
    })
    .then((response) => {
      const result = response.data["Search"];
      totalProducts = result.length;
      res.render("shop/search", {
        products: result,
        pageTitle: "Search Result",
        path: "/search",
        prevPage: pageNo - 1,
        currentPage: pageNo,
        nextPage: pageNo + 1,
        hasNextPage: ITEMS_PER_PAGE * pageNo < totalProducts,
        hasPreviousPage: pageNo > 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
      });
      // return res.json(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
}

function getMovie(req, res, next) {
  const movieId = req.params.mId;

  axios
    .get(`http://www.omdbapi.com/`, {
      params: {
        apikey: OMDB_API_KEY,
        i: movieId,
      },
    })
    .then((response) => {
      const movie = response.data;
      res.render("shop/movie-detail", {
        pageTitle: movie.Title,
        path: "/movies",
        movie,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      next(error);
    });
}

function getList(req, res, next) {
  const listId = req.params.listId;

  MovieList.findOne({ _id: listId })
    .then(async (list) => {
      if (list && list.status === "public") {
        let contentMessage = false;
        const moviesData = [];

        if (list.movies && list.movies.length > 0) {
          contentMessage = true; // If there are movies, set contentMessage to true

          const requests = list.movies.map((movie) => {
            return axios.get(`http://www.omdbapi.com/`, {
              params: {
                apikey: OMDB_API_KEY,
                i: movie.movieId,
              },
            });
          });

          const responses = await Promise.all(requests);

          responses.forEach((response) => {
            moviesData.push(response.data);
          });
        }

        const dataObj = {
          _id: list._id,
          title: list.title,
          status: list.status,
          description: list.description,
          movies: moviesData,
          contentMessage,
          createdAt: list.createdAt,
        };

        res.render("shop/list", {
          pageTitle: dataObj.title,
          path: "/lists",
          list: dataObj,
        });
      } else {
        next(); // List not found
      }
    })
    .catch((err) => {
      const error = new Error(err);
      next(err);
    });
}

module.exports = {
  getIndex,
  postSearch,
  getMovie,
  getList,
};
