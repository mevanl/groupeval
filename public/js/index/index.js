import { load_html } from "../app.js"

document.querySelector("#button_login").addEventListener("click", function(event) {
    load_html("login")
})