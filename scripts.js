/*Esta chamando as tags do html a tribuindo no js */
const openModalButton = document.querySelector("#open-modal");
const closeModalButton = document.querySelector("#close-modal");
const modal = document.querySelector("#modal");
const fade = document.querySelector("#fade");



const toggleModal = () => {
  //[modal, fade].forEach((el) => el.classList.toggle("hide"));
  modal.classList.toggle("hide");
  fade.classList.toggle("hide");
};

[openModalButton, closeModalButton].forEach((el) => {
  el.addEventListener("click", () => toggleModal());
});

