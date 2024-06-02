const shareBackdrop = document.querySelector(".share-backdrop");

document.addEventListener("DOMContentLoaded", function () {
  const shareButtons = document.querySelectorAll(".share-btn");

  shareButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const listId = button.closest(".movie-list").id;
      const dialog = document.createElement("div");
      dialog.classList.add("dialog");

      const link = document.createElement("input");
      link.setAttribute("type", "text");
      link.setAttribute("value", `http://localhost:8000/lists/${listId}`);
      dialog.appendChild(link);
      shareBackdrop.classList.add("share-backdrop--open");
      
      const copyButton = document.createElement("button");
      copyButton.textContent = "Copy";
      copyButton.addEventListener("click", function () {
        link.select();
        document.execCommand("copy");
      });
      dialog.appendChild(copyButton);

      const closeButton = document.createElement("button");
      closeButton.innerHTML = "<i class='fas fa-xmark'></i>";
      closeButton.classList.add("close");
      closeButton.setAttribute("aria-label", "Close dialog");
      closeButton.addEventListener("click", function () {
          dialog.remove();
          shareBackdrop.classList.remove("share-backdrop--open");
      });
      dialog.appendChild(closeButton);

      document.body.appendChild(dialog);
    });
  });
});
