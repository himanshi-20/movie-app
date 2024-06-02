const movieLists = document.getElementById("movieLists");
const createListForm = document.getElementById("createListForm");
const createListBtn = document.getElementById("addpage-createBtn");

movieLists.addEventListener("click", (e) => {
  const list = e.target.closest("li");

  if (list) {
    const checkbox = list.querySelector('input[type="checkbox"]');

    if (e.target === checkbox) {
      return;
    }

    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }
  }
});

function openDialog() {
  document.getElementById("dialogOverlay").classList.add("visible");
}

createListBtn.addEventListener("click", (e) => {
  e.preventDefault();
  openDialog();
});

function closeDialog() {
  document.getElementById("dialogOverlay").classList.remove("visible");
}

function clearFormData(form) {
  form.reset();
}

createListForm.addEventListener("submit", function (event) {
  const csrfToken = createListForm.querySelector('input[name="_csrf"]').value;
  event.preventDefault();
  const formData = new FormData(this);
  const listData = {
    title: formData.get("title"),
    status: formData.get("status"),
    description: formData.get("description"),
  };

  // if (listData) {
  //   closeDialog();
  // }
  console.log(JSON.stringify(listData));
  fetch("/createList", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify(listData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const newList = document.createElement("li");
        newList.innerHTML = `
                <input type="checkbox" name="${data.title}" value="${data.listId}" id="${data.listId}">
                <label for="${data.listId}">${data.title}</label>`;
        const noListHereTitle = movieLists.querySelector("#noListHereTitle");
        if (noListHereTitle) {
          noListHereTitle.remove();
        }
        movieLists.appendChild(newList);
        closeDialog();
        clearFormData(this);
      } else {
        const errors = data.errors || [];
        errors.forEach((error) => {
          const inputField = document.querySelector(`[name="${error.param}"]`);
          inputField.classList.add("invalid");
          inputField.addEventListener("input", () => {
            inputField.classList.remove("invalid");
          });
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
