const cors = require('cors');

const publicList = ['/auth/verify', '/auth/pass-recovery'];
const whiteList = ['http://localhost:3000'];

const customCors = (req, res, next) => {
    if (publicList.includes(req.path)) {
        cors({ credentials: true })(req, res, next);
    } else {
        cors({
            origin: (origin, callback) => {
                whiteList.includes(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'));
            },
            credentials: true
        })(req, res, next);
    }
};

const errorCors = ((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({ error: 'Not allowed by CORS' });
    } else {
        next(err);
    }
})

module.exports = { customCors, errorCors }