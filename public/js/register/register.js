document.querySelector("#txtSubmit").addEventListener("click", function (e) {
    let strUsername = $('#txtEmail').val();
    const strPassword = $('#txtPassword').val();
    const strConfirm_Password = $('#txtConfirm_Password').val();
    const strFirst_Name = $('#txtFirst_Name').val();
    const strLast_Name = $('#txtLast_Name').val();
    const telPhone = $('#txtMobile_Phone_Number').val();
    let blnError = false;
    let strMessage = '';
    strUsername = strUsername.trim();

    const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9-]*\.edu/;
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=~`[\]{}|:;"'<>,.?\\/])(?!.*\s).{10,}$/gm;
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
        })
    }

});

$("#showLoginForm").on('click', function () {
    $("#btnRegistration_Form").hide();
    $("#btnLogin_Form").show();
});