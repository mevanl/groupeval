import { load_page } from "../app.js";

export default function CanclelCreatingClass() {
     document.querySelector("#cancelButton_enroll").addEventListener("click", () => {
         // Navigate back to the dashboard
        load_page("/dashboard");
     });
 }