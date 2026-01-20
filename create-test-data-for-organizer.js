const axios = require('axios');

const API_BASE = 'http://localhost:3002/api/v1';

// Test data for tusharsraj02@gmail.com's hackathons
const HACKATHON_IDS = [
  '3d84ab39-c7d9-463a-a3fc-ebdf7c8c4a2d', // gccX
  '74de72c9-658d-4589-8f28-bfccf2578925'  // gcc
];

async function createTestData() {
  console.log('🚀 Creating test data for tusharsraj02@gmail.com organizer account...');
  
  try {
    // Create 5 test participants
    const participants = [];
    for (let i = 1; i <= 5; i++) {
      const userData = {
        email: `testparticipant${i}@example.com`,
        password: 'password123',
        firstName: `Test${i}`,
        lastName: `Participant`,
        role: 'PARTICIPANT'
      };
      
      try {
        const response = await axios.post(`${API_BASE}/auth/register`, userData);
        participants.push({
          id: response.data.user.id,
          email: userData.email,
          token: response.data.accessToken,
          name: `${userData.firstName} ${userData.lastName}`
        });
        console.log(`✅ Created participant: ${userData.email}`);
      } catch (error) {
        if (error.response?.data?.message?.includes('already exists')) {
          console.log(`ℹ️  Participant already exists: ${userData.email}`);
          // Try to login instead
          try {
            const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
              email: userData.email,
              password: userData.password
            });
            participants.push({
              id: loginResponse.data.user.id,
              email: userData.email,
              token: loginResponse.data.accessToken,
              name: `${userData.firstName} ${userData.lastName}`
            });
            console.log(`✅ Logged in existing participant: ${userData.email}`);
          } catch (loginError) {
            console.error(`❌ Failed to login participant ${userData.email}:`, loginError.message);
          }
        } else {
          console.error(`❌ Failed to create participant ${userData.email}:`, error.message);
        }
      }
    }
    
    console.log(`\n📊 Created ${participants.length} participants`);
    
    // Register participants for hackathons and create submissions
    let submissionCount = 0;
    
    for (const hackathonId of HACKATHON_IDS) {
      console.log(`\n🎯 Processing hackathon: ${hackathonId}`);
      
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        
        try {
          // Register for hackathon
          await axios.post(
            `${API_BASE}/hackathons/${hackathonId}/register`,
            {},
            {
              headers: { Authorization: `Bearer ${participant.token}` }
            }
          );
          console.log(`✅ Registered ${participant.email} for hackathon ${hackathonId}`);
          
          // Create submission for some participants (not all)
          if (i < 3) { // Only first 3 participants submit
            const submissionData = {
              hackathonId: hackathonId,
              title: `Amazing Project ${i + 1} by ${participant.name}`,
              description: `This is a comprehensive project submission for hackathon ${hackathonId}. 
              
The project demonstrates innovative solutions using cutting-edge technology. Key features include:
- Advanced AI integration
- Real-time data processing
- User-friendly interface
- Scalable architecture
- Security best practices

This submission represents hours of dedicated work and creative problem-solving.`,
              techStack: 'React, Node.js, MongoDB, AI/ML, Docker',
              repositoryUrl: `https://github.com/${participant.email.split('@')[0]}/hackathon-project-${i + 1}`,
              selectedTrack: (i % 3) + 1, // Rotate between tracks 1, 2, 3
              files: [
                JSON.stringify({
                  name: `project-${i + 1}-source.zip`,
                  url: `http://localhost:3002/api/v1/uploads/submissions/${hackathonId}/project-${i + 1}-source.zip`,
                  size: 1024 * 1024 * 2.5, // 2.5MB
                  type: 'application/zip'
                }),
                JSON.stringify({
                  name: `presentation-${i + 1}.pdf`,
                  url: `http://localhost:3002/api/v1/uploads/submissions/${hackathonId}/presentation-${i + 1}.pdf`,
                  size: 1024 * 1024 * 5.2, // 5.2MB
                  type: 'application/pdf'
                })
              ],
              isDraft: false // Submit as final
            };
            
            const submissionResponse = await axios.post(
              `${API_BASE}/submissions`,
              submissionData,
              {
                headers: { Authorization: `Bearer ${participant.token}` }
              }
            );
            
            submissionCount++;
            console.log(`✅ Created submission for ${participant.email}: "${submissionData.title}"`);
          }
          
        } catch (error) {
          if (error.response?.data?.message?.includes('already registered')) {
            console.log(`ℹ️  ${participant.email} already registered for hackathon ${hackathonId}`);
          } else {
            console.error(`❌ Error processing ${participant.email} for hackathon ${hackathonId}:`, error.response?.data?.message || error.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 Test data creation completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Participants created/verified: ${participants.length}`);
    console.log(`   - Submissions created: ${submissionCount}`);
    console.log(`   - Hackathons processed: ${HACKATHON_IDS.length}`);
    console.log(`\n✅ tusharsraj02@gmail.com should now see both participants and submissions in the organizer dashboard!`);
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    process.exit(1);
  }
}

createTestData();