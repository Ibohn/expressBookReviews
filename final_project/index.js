const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
// Accept token from Authorization header or from session
  const authHeader = req.headers["authorization"];
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.session && req.session.authorization) {
    // support { accessToken } or { token } shapes
    token =
      req.session.authorization.accessToken ||
      req.session.authorization.token ||
      null;
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing." });
  }

  jwt.verify(token, "access", (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Invalid or expired token.", error: err.message });
    }
    // attach decoded payload (e.g., { username }) for downstream handlers
    req.user = decoded;
    return next();
  });
});
 
const PORT =5006;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));

