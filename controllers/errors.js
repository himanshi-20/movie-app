function pageNotFound(req, res, next) {
  let isLoggedIn;
  if (req.headers.cookie) {
    isLoggedIn = req.headers.cookie.split(";")[0].trim().split("=")[1];
  }
  res.status(404).render("errors/404", {
    pageTitle: "Page not Found!",
    path: null,
  });
}

function serverSideError(req, res, next) {
  res.status(500).render("errors/500", {
    pageTitle: "Server Side Error",
    path: "/500",
  });
}

module.exports = { pageNotFound, serverSideError };
