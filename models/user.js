const mongoose = require("mongoose");
const MovieList = require("./movieList");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  myMovieLists: [
    {
      movieListId: {
        type: Schema.Types.ObjectId,
        ref: "MovieList",
        required: true,
      },
    },
  ],
});

userSchema.methods.newList = function (listId) {
  this.myMovieLists.push({ movieListId: listId.toString() });
  return this.save();
  // const cartProductIndx = updatedCart.items.findIndex(
  //   (p) => p.productId.toString() === product._id.toString()
  // );

  // if (cartProductIndx >= 0) {
  //   updatedCart.items[cartProductIndx].quantity += 1;
  // } else {
  //   updatedCart.items.push({ productId: product._id });
  // }

  // updatedCart.checkoutTotal += product.price;
};

userSchema.methods.addMovieToList = async function (listIds, movieId) {
  try {
    const lists = await MovieList.find({ _id: { $in: listIds } });
    let alreadyExists = false;
    lists.forEach(async (list) => {
      for (const m of list.movies) {
        if (m.movieId === movieId) {
          alreadyExists = true;
        }
      }
      if (!alreadyExists) {
        list.movies.push({ movieId: movieId });
      }
      await list.save();
    });

    console.log("Movies added successfully to lists.");
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

userSchema.methods.removeMovieFromList = async function (listId, movieId) {
  try {
    const movieList = await MovieList.findById(listId);

    if (!movieList) {
      return false;
    }

    const movieIndex = movieList.movies.findIndex(
      (movie) => movie.movieId === movieId
    );

    if (movieIndex === -1) {
      console.log("Movie ID not found in the list");
      return false;
    }
    movieList.movies.splice(movieIndex, 1);
    await movieList.save();

    console.log("Movie removed successfully");
    return true;
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};

userSchema.methods.removeList = async function (listId) {
  let myMovieLists = this.myMovieLists;
  myMovieLists = myMovieLists.filter(
    (list) => list.movieListId.toString() !== listId.toString()
  );
  this.myMovieLists = myMovieLists;
  this.save();

  try {
    const deletedList = await MovieList.deleteOne({ _id: listId });
    console.log("List deleted successfully!");
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// userSchema.methods.removeFromItemFromCart = function (product) {
//   const updatedCart = this.cart;
//   const itemIndex = updatedCart.items.findIndex(
//     (i) => i.productId.toString() === product._id.toString()
//   );
//   updatedCart.items.splice(itemIndex, 1);

//   updatedCart.checkoutTotal -= product.price;
//   this.cart = updatedCart;
//   return this.save();
// };

// userSchema.methods.clearCart = function () {
//   this.cart = {
//     items: [],
//     checkoutTotal: 0,
//   };
//   return this.save();
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
