const usersCollection = require('../models/user-schema');
const jsonwebtokens = require('jsonwebtoken');
const router = require('express').Router();
const SMTP = require('../utils/smtp');
const bcrypt = require('bcrypt');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_ID, process.env.GOOGLE_SECRET);


router.post('/', async (req, res) => {
    try {
        const { tokenAuth } = req.body
        const decodedToken = jsonwebtokens.verify(tokenAuth, process.env.JWT_A);
        res.status(200).json({ email: decodedToken.email });
    } catch (error) {
        console.error('Error verifying tokenAuth');
        res.status(400).json({ message: 'Invalid token' });
    }
});


router.post('/pass-recovery', async (req, res) => {
    try {
        const { email } = req.body

        const validationEmail = await usersCollection.findOne({ email })

        if (validationEmail) {
            const tokenRecovery = jsonwebtokens.sign({email}, process.env.JWT_R, {expiresIn: '1h'})
            SMTP.sendRecovery(email, tokenRecovery);
            res.status(200).json({ message: 'We are going to send you a email' })
        } else {
            res.status(400).json({ message: 'There is no account with this email' })

        }
    }catch(error){
        res.status(500).json({message: 'Error sending recovery email'})
    }
    
})


router.post('/pass-create', async (req, res) => {

    console.log(req)
    const {tokenRecovery} = req.body
    if(tokenRecovery){
        console.log('SI')
        res.status(200).json({message: 'recibidp'})
    }else{
        console.log(`NO`)
        res.status(400).json({message: 'no recibido'})
    }
    console.log(tokenRecovery)
    
   
})


router.post('/google', async (req, res) => {
    const { credential } = req.body;
    try {
        const decodedToken = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_ID });
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

router.post('/signup', async (req, res) => {
    console.log(req.ip)
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

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userInfo = await usersCollection.findOne({ email });

        if (!userInfo.verify || !bcrypt.compareSync(password, userInfo.password)) {
            res.status(400).json({ message: 'Incorrect information or not verified account' });
        } else {
            const tokenAuth = jsonwebtokens.sign({ email }, process.env.JWT_A, { expiresIn: '1h' });
            res.status(200).json({ tokenAuth });
        }
    } catch (error) {
        res.status(400).json({ message: 'Incorrect information or not verified account' });
    }
});

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
        console.error('Error verifying tokenVerify');
        res.send('Invalid or expired verification token');
    }
});

module.exports = router