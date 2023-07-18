const usersCollection = require('../models/user-schema');
const jsonwebtokens = require('jsonwebtoken');
const router = require('express').Router();
const SMTP = require('../utils/smtp');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_ID, process.env.GOOGLE_SECRET);

// Verificar el token de autenticación
router.post('/', async (req, res) => {
    try {
        const { tokenAuth } = req.body;
        const decodedToken = jsonwebtokens.verify(tokenAuth, process.env.JWT_A);
        res.status(200).json({ email: decodedToken.email });
    } catch (error) {
        console.error('Error verifying tokenAuth:', error);
        res.status(400).json({ message: 'Invalid token' });
    }
});

// Autenticación con Google
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    try {
        const decodedToken = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_ID,
        });
        const { email } = decodedToken.getPayload();
        const userInfo = await usersCollection.findOne({ email });

        if (userInfo) {
            const tokenAuth = jsonwebtokens.sign({ email }, process.env.JWT_A, { expiresIn: '1h' });
            res.status(200).json({ tokenAuth });
        } else {
            res.status(404).json({ message: 'Google authentication failed' });
        }
    } catch (error) {
        console.error('Error during Google authentication:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});

// Registro de usuario
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const validationEmail = await usersCollection.findOne({ email });
        const validationUsername = await usersCollection.findOne({ username });

        if (validationEmail) {
            res.status(400).json({ message: 'This email is not available' });
        } else if (validationUsername) {
            res.status(400).json({ message: 'This username is not available' });
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const userInfo = new usersCollection({ username, email, password: hashPassword });
            await userInfo.save();
            const tokenVerify = jsonwebtokens.sign({ email }, process.env.JWT_V, { expiresIn: '1h' });
            SMTP.sendVerify(email, tokenVerify);
            res.status(200).json({ message: 'We have sent you an email with the account verification code' });
        }
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'An error occurred during signup' });
    }
});

// Inicio de sesión
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userInfo = await usersCollection.findOne({ email });

        if (!userInfo || !userInfo.verify || !bcrypt.compareSync(password, userInfo.password)) {
            res.status(400).json({ message: 'Incorrect information or not verified account' });
        } else {
            const tokenAuth = jsonwebtokens.sign({ email }, process.env.JWT_A, { expiresIn: '1h' });
            res.status(200).json({ tokenAuth });
        }
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Error signing in' });
    }
});

// Verificar cuenta de usuario, necesita acceso publico
router.get('/verify', async (req, res) => {
    try {
        const { tokenVerify } = req.query;
        const decoded = jsonwebtokens.verify(tokenVerify, process.env.JWT_V);
        const user = await usersCollection.findOneAndUpdate(
            { email: decoded.email },
            { verify: true },
            { new: true }
        );

        if (user) {
            res.send('Verified, log in');
        } else {
            res.send('Invalid or expired verification token');
        }
    } catch (error) {
        console.error('Error verifying tokenVerify:', error);
        res.send('Invalid or expired verification token');
    }
});

// Recuperación de contraseña
router.post('/pass-recovery', async (req, res) => {
    try {
        const { email } = req.body;
        const validationEmail = await usersCollection.findOne({ email });

        if (validationEmail) {
            const tokenRecovery = jsonwebtokens.sign({ email }, process.env.JWT_R, { expiresIn: '1h' });
            SMTP.sendRecovery(email, tokenRecovery);
            res.status(200).json({ message: 'We have sent you an email with password recovery' });
        } else {
            res.status(400).json({ message: 'This account does not exist' });
        }
    } catch (error) {
        console.error('Error sending recovery email:', error);
        res.status(500).json({ message: 'Error sending recovery email' });
    }
});

// Cambio de contraseña, necesita acceso publico
router.get('/pass-recovery', async (req, res) => {
    try {
        const { tokenRecovery } = req.query;
        await jsonwebtokens.verify(tokenRecovery, process.env.JWT_R);
        res.cookie('tokenRecovery', tokenRecovery);
        res.redirect('http://localhost:3000/auth/pass-change');
    } catch (error) {
        console.error('Error recovering account', error);
        res.send("Error recovering your account")
    }
});

router.post('/pass-change', async (req, res) => {
    try {
        const newEmail = req.body.email;
        const { tokenRecovery } = req.cookies;
        const { email } = jsonwebtokens.verify(tokenRecovery, process.env.JWT_R);
        console.log(email, newEmail)
        await usersCollection.findOneAndUpdate({ email }, { $set: { email: newEmail } });
        res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error('Error changing password', error);
        res.status(500).json({ message: 'Error changing password' })
    }
})

module.exports = router;
