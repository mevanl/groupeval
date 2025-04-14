import { load_page } from "../app.js";

export default function EnrollingClass() {
     
    document.querySelector("#button_submit").addEventListener("click", function (e) {
        const txt_10_Code = document.querySelector("#txt_enrollmentCode").value
        let blnError = false 
        let strMessage = ''

        if( txt_10_Code.length != 10){
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">The Code Must Have 10 Characters.</p>'
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
                text: "Code Confirmed"
            })}


    })
    
    document.querySelector("#button_cancel").addEventListener("click", () => {
         // Navigate back to the dashboard
        load_page("/dashboard");
     });
 }