const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movieListSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movies: [
    {
      movieId: { type: String, required: true },
    },
  ],
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["public", "private"],
    default: "private",
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const MovieList = mongoose.model("MovieList", movieListSchema);

module.exports = MovieList;

