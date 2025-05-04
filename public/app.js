const div_body_content = document.getElementById('body_content')

const pages = {
    '/': { html: '/pages/home.html', script: '/scripts/home.js' },
    '/login': { html: '/pages/login.html', script: '/scripts/login.js' },
    '/register': { html: '/pages/register.html', script: '/scripts/register.js' },
    '/dashboard': { html: '/pages/dashboard.html', script: '/scripts/dashboard.js' },
    '/create-a-class': { html: '/pages/create-a-class.html', script: '/scripts/create-a-class.js' },
    '/enroll': { html: '/pages/enroll.html', script: '/scripts/enroll.js' },
    '/class_teacher_view': { html: '/pages/class_teacher_view.html', script: '/scripts/class_teacher_view.js' },
    '/create_review': {html: 'pages/create_review.html', script: '/scripts/create_review.js' },
    '/review_teacher_view': {html: 'pages/review_teacher_view.html', script: '/scripts/review_teacher_view.js' },
    '/review_student_view': {html: 'pages/review_student_view.html', script: '/scripts/review_student_view.js' },
    '/class_student_view': { html: '/pages/class_student_view.html', script: '/scripts/class_student_view.js' },
    '/create_group': { html: '/pages/create_group.html', script: '/scripts/create_group.js' },
    '/join_group': { html: '/pages/join_group.html', script: '/scripts/join_group.js' },
    '/group_members': { html: '/pages/group_member.html', script: '/scripts/group_member.js' }, 
    '/submission_teacher_view' : { html: '/pages/submission_teacher_view.html', script: '/scripts/submission_teacher_view.js' },
}


async function load_page(path, update_history = true) {
    const page = pages[path] || pages['/']

    try {
        // Load the html
        const html = await fetch(page.html).then(response => response.text())
        div_body_content.innerHTML = html 

        // Load the script if exists
        if (page.script) {
            const module = await import(page.script)
            module.default?.()
        }

        if (update_history) {
            window.history.pushState({}, '', path)
        }

    } catch (err) {
        console.log(`Error loading page at ${path}`, err)
        div_body_content.innerHTML = `<p>Error loading page</p>`
    }
}


window.addEventListener('popstate', () => {
    load_page(location.pathname, false)
})


load_page(location.pathname)
export { load_page }