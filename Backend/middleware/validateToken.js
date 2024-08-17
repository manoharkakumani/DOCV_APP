
import JWT from 'jsonwebtoken'

export const validateToken = async(req, res, next) => {
    let token
    let authHeader = req.headers.Authorization || req.headers.authorization
    if(authHeader && authHeader.startsWith("Bearer")) {
        try
        { 
        token = authHeader.split(" ")[1]
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err) {
                return res.status(401).json({ message: "User is not authorized or token is missing" })
            }
            console.log(decoded)
            req.user = decoded.user
            next()
        })
        if(!token) {
            return res.status(401).json({ message: "User is not authorized or token is missing" })
        }
        } catch (error) {
            return res.status(401).json({ message: "User is not authorized or token is missing" })
        }
    }else
    {
        return res.status(401).json({ message: "User is not authorized" })
    }
}