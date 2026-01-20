const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

// Test registering some load test users for hackathons
async function registerUsersForHackathon() {
  console.log('🎯 Testing hackathon registration for load test users...\n');

  try {
    // First, get available hackathons
    console.log('📋 Fetching available hackathons...');
    const hackathonsResponse = await fetch(`${BASE_URL}/hackathons`);
    const hackathons = await hackathonsResponse.json();
    
    if (hackathons.length === 0) {
      console.log('❌ No hackathons found');
      return;
    }

    const hackathon = hackathons[0]; // Use the first hackathon
    console.log(`✅ Found hackathon: "${hackathon.title}" (ID: ${hackathon.id})`);
    console.log(`   Status: ${hackathon.status}`);
    console.log(`   Type: ${hackathon.type}\n`);

    // Test with first 10 load test users
    const testUsers = [];
    for (let i = 1; i <= 10; i++) {
      testUsers.push({
        email: `testuser${i}@loadtest.com`,
        password: `password123${i}`
      });
    }

    console.log('🔐 Logging in test users and registering for hackathon...\n');

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const user of testUsers) {
      try {
        // Login to get token
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });

        if (!loginResponse.ok) {
          throw new Error(`Login failed: ${loginResponse.statusText}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.accessToken;

        console.log(`🔐 Logged in: ${user.email}`);

        // Register for hackathon
        const registrationResponse = await fetch(`${BASE_URL}/hackathons/${hackathon.id}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            selectedTrack: 1
          })
        });

        if (!registrationResponse.ok) {
          const errorData = await registrationResponse.json();
          throw new Error(`Registration failed: ${errorData.message || registrationResponse.statusText}`);
        }

        const registrationData = await registrationResponse.json();
        console.log(`✅ Registered: ${user.email} for hackathon "${hackathon.title}"`);
        results.successful++;

      } catch (error) {
        console.log(`❌ Failed: ${user.email} - ${error.message}`);
        results.failed++;
        results.errors.push(`${user.email}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 HACKATHON REGISTRATION RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Successful registrations: ${results.successful}/10`);
    console.log(`❌ Failed registrations: ${results.failed}/10`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(error => console.log(`   ${error}`));
    }

    // Now check participants list
    console.log('\n🔍 Checking participants list...');
    
    const participantsResponse = await fetch(`${BASE_URL}/hackathons/${hackathon.id}/participants`, {
      headers: {
        'Authorization': `Bearer ${testUsers[0] ? (await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUsers[0])
        }).then(r => r.json())).accessToken : ''}`
      }
    });

    if (participantsResponse.ok) {
      const participants = await participantsResponse.json();
      console.log(`\n📋 Total participants in "${hackathon.title}": ${participants.length}`);
      
      const loadTestParticipants = participants.filter(p => 
        p.user.email.includes('@loadtest.com')
      );
      
      console.log(`🧪 Load test participants: ${loadTestParticipants.length}`);
      
      if (loadTestParticipants.length > 0) {
        console.log('\n👥 Load test participants registered:');
        loadTestParticipants.forEach(p => {
          console.log(`   - ${p.user.firstName} ${p.user.lastName} (${p.user.email})`);
          console.log(`     Role: ${p.role}, Has Submission: ${p.hasSubmission ? 'Yes' : 'No'}`);
        });
      }
    } else {
      console.log('❌ Could not fetch participants list');
    }

    console.log('\n🎯 CONCLUSION:');
    if (results.successful > 0) {
      console.log(`✅ SUCCESS! ${results.successful} load test users are now registered for the hackathon`);
      console.log('✅ These users will now appear in the organizer\'s participant list');
      console.log('✅ Organizers can see their registration status and submissions');
    } else {
      console.log('❌ No users were successfully registered for the hackathon');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
registerUsersForHackathon();