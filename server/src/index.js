const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const app = require('express')();
const cors = require('cors');

//middlewars
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: (origin, callback) => { origin === 'http://localhost:3000/' ? callback(null, true) : callback(new Error('Not allowed by CORS')) } }))
app.use(rateLimit({ windowMs: 5 * 60 * 1000, max: 100, message: 'We are reciving hig demand of requests' }))

//routes
app.use('/wallet', require('./routes/wallet'));
app.use('/auth', require('./routes/auth'));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));