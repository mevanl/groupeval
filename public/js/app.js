export function load_html(html_page) {
    fetch(`../components/${html_page}.html`)
    .then(response => response.text())
    .then(html => {
        document.querySelector("#body_content").innerHTML = html
    })
    .catch(error => {
        console.error(`Error loading page: ${html_page}.\nError: `, error)
    })
}