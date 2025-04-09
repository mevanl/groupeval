import { load_page } from "../app.js"

document.querySelector("#button_login").addEventListener("click", function(event) {
    load_page("/login")
})

document.querySelector('#button_register').addEventListener("click", function(event) {
    load_page("/register")
})
