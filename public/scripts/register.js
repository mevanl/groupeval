import { load_page } from "../app.js"

export default function init() {
    document.querySelector("#btnSubmit").addEventListener("click", function (e) {
        let strUsername = document.querySelector("#txtEmail").value
        const strPassword = document.querySelector("#txtPassword").value
        const strConfirm_Password = document.querySelector("#txtConfirm_Password").value
        const strFirst_Name = document.querySelector("#txtFirst_Name").value
        const strLast_Name = document.querySelector("#txtLast_Name").value
        const telPhone = document.querySelector("#telMobile_Phone_Number").value
        let blnError = false 
        let strMessage = ''
        strUsername = strUsername.trim()
    
        const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
        const phonePattern = /^(\d )?\(\d{3}\) \d{3}-\d{4}$/gm;
    
        if (!emailPattern.test(strUsername)) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Invalid Email Address.</p>';
        }
    
        if (!passwordPattern.test(strPassword)) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Invalid Password.</p>';
        }
    
        if (strPassword != strConfirm_Password) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Pasword and Confirmation Password does not match.</p>';
        }
    
        if (strFirst_Name.length < 1) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Cannot Leave First Name Blank.</p>';
        }
    
        if (strLast_Name.length < 1) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Cannot Leave Last Name Blank.</p>';
        }
    
        if (!phonePattern.test(telPhone)) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Invalid Phone Number Format.</p>';
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
                text: "Registration Confirmed"
            }).then(() => {
                load_page("/login"); 
            })
        }
    
    });
    
    document.querySelector("#showLoginForm").addEventListener("click", function(event) { 
        load_page("/login") 
    })
}
