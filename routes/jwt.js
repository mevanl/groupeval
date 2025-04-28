const jwt = require("jsonwebtoken")


const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'my_production_level_key'


const generate_user_token = (user_email) => {
    const jwt_payload = {user_email}

    const token = jwt.sign(jwt_payload, JWT_SECRET_KEY, {expiresIn: '12h'})

    return token
}

const verify_user_token = (request, response, next) => {
    
    // get our auth header
    const string_auth_header = request.headers.authorization

    // validate auth header
    if (!string_auth_header) {
        return response.status(401).json({ error: "Auhtorization header is required" })
    }

    const string_token = string_auth_header.split(' ')[1]

    if (string_token == null || !string_token) {
        return response.status(401).json({ error: "You must have an active session to perform this function" })
    }

    jwt.verify(string_token, JWT_SECRET_KEY, (error, decoded) => {
        if (error) {
            return response.status(401).json({ error: "Invalid or expired token" })
        }

        request.user = decoded
        next()
    })
}


module.exports = {generate_user_token, verify_user_token}