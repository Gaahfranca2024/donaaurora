const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Mystic Tarot API is running', status: 'online' });
});

// Keep-alive ping for Render
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
    setInterval(async () => {
        try {
            console.log('Sending keep-alive ping...');
            await axios.get(RENDER_URL);
            console.log('Keep-alive ping successful');
        } catch (error) {
            console.error('Keep-alive ping failed:', error.message);
        }
    }, 14 * 60 * 1000); // 14 minutes
}

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
