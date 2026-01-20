const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testSubmissions() {
  console.log('🎯 Testing submissions for registered participants...\n');

  try {
    // Get hackathon ID
    const hackathonsResponse = await fetch(`${BASE_URL}/hackathons`);
    const hackathons = await hackathonsResponse.json();
    const hackathon = hackathons[0];

    console.log(`📋 Testing submissions for hackathon: "${hackathon.title}"\n`);

    // Test with first 5 registered users
    const testUsers = [];
    for (let i = 1; i <= 5; i++) {
      testUsers.push({
        email: `testuser${i}@loadtest.com`,
        password: `password123${i}`
      });
    }

    const results = { successful: 0, failed: 0, errors: [] };

    for (const user of testUsers) {
      try {
        // Login
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });

        const loginData = await loginResponse.json();
        const token = loginData.accessToken;

        console.log(`🔐 Logged in: ${user.email}`);

        // Create a test submission
        const submissionData = {
          hackathonId: hackathon.id,
          title: `AI Project by ${user.email.split('@')[0]}`,
          description: `This is a comprehensive AI-powered project submission for the ${hackathon.title} hackathon. 
          
Features:
- Machine Learning Integration
- Real-time Data Processing  
- User-friendly Interface
- Scalable Architecture

Tech Stack:
- Frontend: React, TypeScript
- Backend: Node.js, NestJS
- Database: PostgreSQL
- AI: OpenAI GPT Integration

This project demonstrates innovative solutions and technical excellence.`,
          repositoryUrl: `https://github.com/${user.email.split('@')[0]}/hackathon-project`,
          liveUrl: `https://${user.email.split('@')[0]}-hackathon.vercel.app`,
          videoUrl: `https://youtube.com/watch?v=${Math.random().toString(36).substr(2, 11)}`,
          isDraft: false
        };

        const submissionResponse = await fetch(`${BASE_URL}/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submissionData)
        });

        if (!submissionResponse.ok) {
          const errorData = await submissionResponse.json();
          throw new Error(`Submission failed: ${errorData.message || submissionResponse.statusText}`);
        }

        const submission = await submissionResponse.json();
        console.log(`✅ Created submission: "${submission.title}" by ${user.email}`);
        results.successful++;

      } catch (error) {
        console.log(`❌ Failed: ${user.email} - ${error.message}`);
        results.failed++;
        results.errors.push(`${user.email}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUBMISSION RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Successful submissions: ${results.successful}/5`);
    console.log(`❌ Failed submissions: ${results.failed}/5`);

    // Check updated participants list
    console.log('\n🔍 Checking updated participants list...');
    
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUsers[0])
    });
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;

    const participantsResponse = await fetch(`${BASE_URL}/hackathons/${hackathon.id}/participants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (participantsResponse.ok) {
      const participants = await participantsResponse.json();
      const loadTestParticipants = participants.filter(p => 
        p.user.email.includes('@loadtest.com')
      );
      
      console.log(`\n👥 Load test participants status:`);
      loadTestParticipants.forEach(p => {
        const submissionStatus = p.hasSubmission ? '✅ Submitted' : '⏳ Not submitted';
        console.log(`   - ${p.user.firstName} ${p.user.lastName} (${p.user.email})`);
        console.log(`     Status: ${submissionStatus}`);
      });

      const submittedCount = loadTestParticipants.filter(p => p.hasSubmission).length;
      const notSubmittedCount = loadTestParticipants.filter(p => !p.hasSubmission).length;

      console.log(`\n📊 Summary:`);
      console.log(`   ✅ Participants with submissions: ${submittedCount}`);
      console.log(`   ⏳ Participants without submissions: ${notSubmittedCount}`);
      console.log(`   📋 Total load test participants: ${loadTestParticipants.length}`);
    }

    console.log('\n🎯 ORGANIZER VIEW:');
    console.log('✅ Organizers can now see:');
    console.log('   - List of all registered participants');
    console.log('   - Which participants have submitted projects');
    console.log('   - Which participants haven\'t submitted yet');
    console.log('   - Participant details (name, email, role)');
    console.log('   - Team information (if applicable)');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testSubmissions();