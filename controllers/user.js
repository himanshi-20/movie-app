const dotenv = require("dotenv");

dotenv.config();

const OMDB_API_KEY = process.env.OMDB_API_KEY;

const { validationResult } = require("express-validator");
const MovieList = require("../models/movieList.js");
const { default: axios } = require("axios");

function getMyLists(req, res, next) {
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

      res.render("user/mlists", {
        pageTitle: "My Movie Lists",
        path: "/mlists",
        movieLists: dataObj,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      next(err);
    });
}

function getCreateList(req, res, next) {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("user/edit-list", {
    pageTitle: "Create list",
    path: "/create",
    editing: false,
    message: null,
    hasError: false,
    validationErrors: null,
  });
}

async function postCreateList(req, res, next) {
  const { title, status, description } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    message = errors.array()[0].msg;
    return res.status(422).render("user/edit-list", {
      pageTitle: "Create a List",
      path: "/create",
      editing: false,
      message: message,
      hasError: true,
      list: {
        title,
        status,
        description,
      },
      validationErrors: errors.array(),
    });
  }

  try {
    const list = new MovieList({
      userId: req.user._id,
      movies: [],
      title,
      status,
      description,
    });
    const savedList = await list.save();
    await req.user.newList(savedList._id);
    res.redirect("/mlists");
  } catch (error) {
    const addingError = new Error(error);
    addingError.httpStatusCode = 500;
    next(addingError);
  }
}

function getAddMovie(req, res, next) {
  const movieId = req.params.mId;
  let movie = {};

  axios
    .get(`http://www.omdbapi.com/`, {
      params: {
        apikey: OMDB_API_KEY,
        i: movieId,
      },
    })
    .then((response) => {
      movie = response.data;
      const myMovieListsIdObjs = req.user.myMovieLists;
      let myMovieListsId = [];
      if (myMovieListsIdObjs.length > 0) {
        for (const obj of myMovieListsIdObjs) {
          myMovieListsId.push(obj["movieListId"]);
        }
      }
      return MovieList.find({ _id: { $in: myMovieListsId } });
    })
    .then((response) => {
      const movieLists = response;
      // console.log(movieLists);
      res.render("user/addmovie", {
        movieLists,
        movie,
        pageTitle: `Adding movie`,
        path: "/addmovie",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      console.log(error);
      next(error);
    });
}

function postAddMovie(req, res, next) {
  const movieId = req.params.mId;
  const movieListsId = [];
  for (const key in req.body) {
    if (key !== "_csrf") {
      const movieListId = req.body[key];
      movieListsId.push(movieListId);
    }
  }
  req.user.addMovieToList(movieListsId, movieId);
  res.redirect("/mlists");
}

async function postNewList(req, res, next) {
  const { title, status, description } = req.body;
  const userId = req.user._id;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    return res.status(400).json({ success: false, error: message });
  }

  try {
    const newList = new MovieList({
      userId,
      title,
      status,
      description,
    });

    const savedList = await newList.save();
    await req.user.newList(savedList._id);
    res.json({ success: true, listId: savedList._id, title: savedList.title });
  } catch (error) {
    console.error("Error creating list:", error);
    res.status(500).json({ success: false, error: "Error creating list" });
  }
}

async function getRemoveMovie(req, res, next) {
  const movieId = req.params.mId;
  const listId = req.query.lId;
  let allowedUser = false;

  for (const list of req.user.myMovieLists) {
    if (list.movieListId.toString() === listId.toString()) {
      allowedUser = true;
    }
  }

  if (!allowedUser) {
    res.redirect("/");
  } else {
    const result = await req.user.removeMovieFromList(listId, movieId);
    if (result) {
      res.redirect("/mlists");
    } else {
      res.render("errors/unauth", { path: "/unauth", pageTitle: "Invalid" });
    }
  }
}

async function getDeleteList(req, res, next) {
  const listId = req.params.listId;

  let allowedUser = false;

  for (const list of req.user.myMovieLists) {
    if (list.movieListId.toString() === listId.toString()) {
      allowedUser = true;
    }
  }

  if (!allowedUser) {
    res.redirect("/");
  } else {
    const result = await req.user.removeList(listId);
    if (result) {
      res.redirect("/mlists");
    } else {
      res.render("errors/unauth", { path: "/unauth", pageTitle: "Invalid" });
    }
  }
}

function getEditList(req, res, next) {
  const listId = req.params.listId;
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  MovieList.findOne({ _id: listId })
    .then((response) => {
      const list = response;
      res.render("user/edit-list", {
        pageTitle: "Edit List",
        path: "/edit",
        editing: true,
        message: null,
        hasError: false,
        validationErrors: null,
        list,
      });
    })
    .catch((err) => console.log(err));
}

async function postEditList(req, res, next) {
  const listId = req.params.listId;
  const { title, status, description } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    message = errors.array()[0].msg;
    return res.status(422).render("user/edit-list", {
      pageTitle: "Edit List",
      path: "/edit",
      editing: True,
      message: message,
      hasError: true,
      list: {
        _id: listId,
        title,
        status,
        description,
      },
      validationErrors: errors.array(),
    });
  }

  try {
    const updatedList = await MovieList.findOneAndUpdate(
      { _id: listId },
      { $set: { title, status, description } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedList) {
      console.log("Movie list not found");
      return res.redirect("/mlists");
    }

    console.log("Movie list updated successfully!");
    res.redirect("/mlists");
  } catch (error) {
    const addingError = new Error(error);
    addingError.httpStatusCode = 500;
    next(addingError);
  }
}

module.exports = {
  getMyLists,
  getCreateList,
  postCreateList,
  getAddMovie,
  postAddMovie,
  postNewList,
  getRemoveMovie,
  getDeleteList,
  getEditList,
  postEditList,
};
