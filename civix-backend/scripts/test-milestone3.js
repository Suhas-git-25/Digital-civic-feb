const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Poll = require('../src/models/poll');
const Vote = require('../src/models/vote');

const API_URL = 'http://localhost:5001/api';

async function testMilestone3() {
  console.log('--- STARTING MILESTONE 3 BACKEND TESTS ---\\n');

  try {
    // Connect to DB directly for cleanup
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear test data if any
    await User.deleteMany({ email: { $in: ['official_test_user@example.com', 'citizen_test_user@example.com'] } });
    
    console.log('1. Setting up test users...');
    
    // Register official user
    const officialRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Official Test', email: 'official_test_user@example.com', password: 'password123', location: 'Delhi', role: 'official' })
    });
    const officialData = await officialRes.json();
    const officialToken = officialRes.headers.get('set-cookie')?.split(';')[0]?.split('=')[1] || officialData.token;
    console.log('- Official registered successfully.');

    // Register citizen user
    const citizenRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Citizen Test', email: 'citizen_test_user@example.com', password: 'password123', location: 'Delhi', role: 'citizen' })
    });
    const citizenData = await citizenRes.json();
    const citizenToken = citizenRes.headers.get('set-cookie')?.split(';')[0]?.split('=')[1] || citizenData.token;
    console.log('- Citizen registered successfully.\\n');

    // CREATE POLL (As Official)
    console.log('2. Testing Poll Creation (Required: Official/Admin role)');
    const createPollRes = await fetch(`${API_URL}/polls`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${officialToken}`
      },
      body: JSON.stringify({
        title: 'Should we build a new community center?',
        options: ['Yes', 'No', 'Maybe'],
        targetLocation: 'Delhi'
      })
    });
    const pollData = await createPollRes.json();
    console.log(createPollRes.status === 201 ? '✅ Poll created successfully!' : '❌ Poll creation failed!');
    console.log(pollData);

    const pollId = pollData._id;

    // GET POLLS
    console.log('\\n3. Testing Get Polls');
    const getPollsRes = await fetch(`${API_URL}/polls`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });
    const pollsListData = await getPollsRes.json();
    console.log(getPollsRes.status === 200 ? '✅ Fetched polls list successfully!' : '❌ Fetching polls failed!');
    console.log(`Found ${pollsListData.polls?.length} polls.\\n`);

    // VOTE ON POLL (As Citizen)
    console.log('4. Testing Voting (Required: Citizen role)');
    const voteRes = await fetch(`${API_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({ selectedOption: 'Yes' })
    });
    const voteData = await voteRes.json();
    console.log(voteRes.status === 201 ? '✅ Vote cast successfully!' : '❌ Voting failed!');
    console.log(voteData);

    // FETCH SPECIFIC POLL WITH AGGREGATED STATS
    console.log('\\n5. Testing Poll Results/Aggregation');
    const getPollRes = await fetch(`${API_URL}/polls/${pollId}`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });
    const pollDetailsData = await getPollRes.json();
    console.log(getPollRes.status === 200 ? '✅ Fetched aggregated poll results successfully!' : '❌ Fetching poll results failed!');
    console.log(JSON.stringify(pollDetailsData, null, 2));

  } catch (err) {
    console.error('Test script encountered an error:', err);
  } finally {
    // Cleanup
    await mongoose.disconnect();
    console.log('\\n--- TESTS FINISHED ---');
  }
}

// Execute tests
testMilestone3();
