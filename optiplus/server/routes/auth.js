const express = require('express');
const router = express.Router();

const VALID_CREDENTIALS = {
    reception: {
        username: 'optiplus',
        password: 'optiplusMoiAvenue'
    },
    examination: {
        username: 'optiplus',
        password: 'optiplusMoiAvenue'
    },
    admin: {
        username: 'admin',
        password: 'adminMoiAvenue'
    }
};

router.post('/login', (req, res) => {
    const { username, password, department } = req.body;
    
    const validCreds = VALID_CREDENTIALS[department];
    if (!validCreds || validCreds.username !== username || validCreds.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create simple token for local network use
    const token = Buffer.from(`${username}:${department}`).toString('base64');
    res.json({ token, department });
});

module.exports = router;