// Script that allows user to change between light or dark mode, saves in local storage

const body = document.body
const toggle_button = document.querySelector("#button_toggle_dark_mode")

function toggle_dark_mode() {
    if (body.classList.contains("bg-light")) {
        body.classList.remove("bg-light", "text-dark")
        body.classList.add("bg-dark", "text-light")
        localStorage.setItem("dark_mode", "enabled")
    } else {
        body.classList.remove("bg-dark", "text-light")
        body.classList.add("bg-light", "text-dark")
        localStorage.setItem("dark_mode", "disabled")
    }
}


if (localStorage.getItem("dark_mode") === "enabled") {
    body.classList.remove("bg-light", "text-dark")
    body.classList.add("bg-dark", "text-light")
}

toggle_button.addEventListener("click", toggle_dark_mode)
