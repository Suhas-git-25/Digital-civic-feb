const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Petition = require('./src/models/petition');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civix';

async function checkPetitions() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const petitions = await Petition.find({});
        console.log(`Found ${petitions.length} petitions:`);
        petitions.forEach(p => {
            console.log(`- ${p.title} (Status: ${p.status}, Creator: ${p.creator})`);
        });

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error:', err);
    }
}

checkPetitions();
