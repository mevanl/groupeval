import { load_html } from "../app.js"


document.querySelector("#txt_Login_Submit").addEventListener("click", function (e) {
    const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    
    const string_username = document.querySelector("#txt_Login_Email").value
    const string_password = document.querySelector("#txt_Login_Password").value

    let blnError = false;
    let strMessage = '';


    if (!emailPattern.test(string_username)) {
        blnError = true;
        strMessage += '<p class="mb-0 mt-0">Invalid Email Address.</p>';
    }

    if (!passwordPattern.test(string_password)) {
        blnError = true;
        strMessage += '<p class="mb-0 mt-0">Invalid Password.</p>';
    }

    if (blnError) {
        Swal.fire({
            icon: 'error',
            html: strMessage,
            text: "Validation Error"
        })
    }

    else {
        Swal.fire({
            icon: 'success',
            text: "Login Confirmed"
        })
    }
})


document.querySelector("#showRegistrationForm").addEventListener("click", function(event) {
    load_html("register")
})
