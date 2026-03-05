const axios = require('axios');

async function testApi() {
    try {
        const res = await axios.get('http://localhost:5001/api/petitions');
        console.log('Petitions List Sample:', JSON.stringify(res.data.petitions[0], null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testApi();
