let current_page = ""


export function load_html(html_page) {
    if (current_page === html_page) {
        return;  // Do nothing if the same page is already loaded
    }

    fetch(`../components/${html_page}.html`)
    .then(response => response.text())
    .then(html => {
        // Update content in #body_content div
        document.querySelector("#body_content").innerHTML = html;
        current_page = html_page;
        history.pushState({ page: html_page }, "", `/${html_page}`);

        load_script(html_page);

    })
    .catch(error => {
        console.error(`Error loading page: ${html_page}.\nError: `, error);
    });

}

function load_script(script_name) {
    const script_div = document.querySelector("#page_script")

    // clear existing script
    script_div.innerHTML = ""

    // generate our new script tag for the correct page
    const script = document.createElement("script")
    script.type = "module"
    script.src = `js/${script_name}/${script_name}.js`
    script.setAttribute("data-dynamic", "true")
    script_div.appendChild(script);
}

window.addEventListener("popstate", (event) => {
    if (event.state && event.state.page) {
        current_page = event.state.page;
        if (current_page !== "index") {
            load_html(current_page);  // Load the appropriate content for other pages
        } else {
            // else reset the content
            document.querySelector("#body_content").innerHTML = ""; 
            document.querySelector("#page_script").innerHTML = ""; // Clear script
        }
    } else {
        window.location.href = "/";
        document.querySelector("#page_script").innerHTML = ""; // Clear script
    }
});
