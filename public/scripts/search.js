const submitForm = document.getElementById("search-form");

submitForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const searchQuery = submitForm.querySelector("#search-input").value;
  // console.log(searchQuery)
  this.action = `/search?q=${searchQuery}`;
  this.submit();
});
