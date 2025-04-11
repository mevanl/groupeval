import { load_page } from "../app.js";

export default function EnrollingClass() {
     
    document.querySelector("#submitButton_enroll").addEventListener("click", function (e) {
        const txt_10_Code = document.querySelector("#txt_enrollmentCode").value
        let blnError = false 
        let strMessage = ''

        if( txt_10_Code.length != 10){
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">The Code Must Have 10 Characters (Teacher is supposed to send it to you).</p>'
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
    
    document.querySelector("#cancelButton_enroll").addEventListener("click", () => {
         // Navigate back to the dashboard
        load_page("/dashboard");
     });
 }