const path = require('path');
const express = require('express');
// Import express-session
const session = require('express-session');
const exphbs = require('express-handlebars');

const routes = require('./controllers');
const sequelize = require('./config/connection');
const helpers = require('./utils/helpers');
// import packages http, https, fs for https. To create self cert do this from the command line $ openssl req -nodes -new -x509 -keyout server.key -out server.cert
// Andres --> added/changed
const https = require('https');
const http = require('http');
const fs = require('fs');
//Using a custom signature algorithm for the session.keys; the keygrip library most be installed with npm: $ npm install keygrip // Andres --> added/changed
var Keygrip = require('keygrip')
    // bringin-on the 'connect-session-sequelize' library, and setting it up with (session.Store). That is going to store session information in the database // Andres --> added/changed
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const app = express();
// 3001 is the original port // Andres --> added/changed
//const PORT = process.env.PORT || 3001;
// 8080 is the http port // Andres --> added/changed
const PORT = process.env.PORT || 8080;
// 8088 is the httpS port // Andres --> added/changed
const sPORT = process.env.PORT || 8088;

// Set up sessions with cookies // Andres --> added/changed
const sess = {
    name: 'h4K3',
    secret: 'Super secret secret',
    keys: new Keygrip(['key1', 'key2'], 'SHA512', 'SHA384'),
    cookie: {
        // Stored in milliseconds (86400 === 1 day)
        maxAge: 86400,
        sameSite: 'strict',
        secure: true,
        httpOnly: true,
        /*
- session.name: Using the default session cookie name can open your app to attacks.
- session.keys: The list of keys to use to sign & verify cookie values, or a configured Keygrip instance. Set cookies are always signed with keys[0], while the other keys are valid for verification, allowing for key rotation. If a Keygrip instance is provided, it can be used to change signature parameters like the algorithm of the signature.
- session.saveUninitialized: Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified. Choosing false is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie. Choosing false will also help with race conditions where a client makes multiple parallel requests without a session.
- The "cookie.secure" attribute when set to True, limits the scope of the cookie to "secure" httpS channels. The purpose of the secure attribute is to prevent cookies from being observed by unauthorized parties due to the transmission of the cookie in clear text. To accomplish this goal, browsers which support the secure attribute will only send cookies with the secure attribute when the request is going to an HTTPS page
- The "cookie.sameSite(strict)" attribute limits the scope of the cookie such that it will only be attached to requests if those requests are same-site. For example, requests for "https://example.com/sekrit-image" will attach same-site cookies if and only if initiated from a context whose "site for cookies" is "example.com". SameSite prevents the browser from sending this cookie along with cross-site requests. The main goal is to mitigate the risk of cross-origin information leakage. It also provides some protection against cross-site request forgery attacks.
-The "cookie.httpOnly" is an additional flag included in a Set-Cookie HTTP response header. Using the HttpOnly flag when generating a cookie helps mitigate the risk of client side script accessing the protected cookie (if the browser supports it).
*/
    },
    resave: false,
    // here saveUninitialized was set to true
    saveUninitialized: false,
    //'express-session'  monitors the expiration of the sessions living on the DB every 15mins, and if they expire then it removes them automatizally from the DB
    store: new SequelizeStore({
        db: sequelize,
    }),
};
// Andres --> added/changed
const httpServer = http.createServer(app);
// To create self certs do this from the command line (on windows): $ openssl req -nodes -new -x509 -keyout server.key -out server.cert. I had to add the certs on my activity folder. below the cert names do not have any directory because the certs are on the root directory of this activity: 14-MVC\01-Activities\17-Ins_Cookies\server.cert // Andres --> added/changed
const httpsServer = https.createServer({
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
}, app);
// Set up sessions
app.use(session(sess));

const hbs = exphbs.create({ helpers });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

sequelize.sync({ force: false }).then(() => {
    // Andres --> added/changed
    httpServer.listen(PORT, () => {
        console.log(`\nhttp Server running on port ${PORT}. Visit http://localhost:${PORT} and create an account!`);
    });
    httpsServer.listen(sPORT, () => {
        console.log(`\nhttpS Server running on port ${sPORT}. Visit httpS://localhost:${sPORT} and create an account!`);
    });
});