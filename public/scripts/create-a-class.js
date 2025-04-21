import { load_page } from "../app.js";

export default function CreatingClass() {
    
    document.querySelector("#button_submit").addEventListener("click", function (e) {
        const Class_Name = document.querySelector("#txt_className").value.trim()
        const Class_Lable = document.querySelector("#txt_classLabel").value.trim()
        const Class_Section = document.querySelector("#txt_classSection").value.trim()
        const Students_Emials = document.querySelector("#studentEmails").value.trim()
        const Class_Term = document.querySelector("#txt_classterm").value.trim()

        let blnError = false 
        let strMessage = ''

        if (Class_Name.length < 1) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Must Have Class Name.</p>';
        }

        if (Class_Lable.length < 1) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Class Must Have A Class Code.</p>';
        }

        if (Class_Section.length < 1) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Class Must Have A Class Section.</p>';
        }

        if (Class_Section.length < 1) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Class Must Have A Class Term.</p>';
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
                text: "Class Created"
            })}


    })
    
    document.querySelector("#button_cancel").addEventListener("click", () => {
         // Navigate back to the dashboard
        load_page("/dashboard");
     });
 }