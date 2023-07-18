const app = require('express')();
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { customCors, errorCors } = require('./utils/cors');

//middlewars
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(rateLimit({ windowMs: 5 * 60 * 1000, max: 100, message: 'We are reciving hig demand of requests' }))
app.use(customCors);
app.use(errorCors);

//routes
app.use('/wallet', require('./routes/wallet'));
app.use('/auth', require('./routes/auth'));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));