const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002/api/v1';
const NUM_USERS = 70;
const CONCURRENT_BATCHES = 10;
const BATCH_SIZE = Math.ceil(NUM_USERS / CONCURRENT_BATCHES);

// Test results tracking
const results = {
  userCreation: { success: 0, failed: 0, errors: [] },
  hackathonRegistration: { success: 0, failed: 0, errors: [] },
  submissions: { success: 0, failed: 0, errors: [] },
  totalTime: 0,
  userResults: []
};

// Generate test data
function generateUser(index) {
  return {
    firstName: `LoadUser${index}`,
    lastName: `Test${index}`,
    email: `loaduser${index}@hackathontest.com`,
    password: `loadpass123${index}`
  };
}

// Create test submission content
function createSubmissionData(userIndex, hackathonId) {
  const projects = [
    'AI-Powered Healthcare Assistant',
    'Smart City Traffic Optimizer', 
    'Blockchain Supply Chain Tracker',
    'ML-Based Climate Predictor',
    'AR Educational Platform',
    'IoT Home Automation System',
    'Quantum Computing Simulator',
    'Neural Network Art Generator',
    'Autonomous Drone Navigator',
    'Voice-Controlled Smart Assistant'
  ];

  const techStacks = [
    'React, Node.js, TensorFlow, MongoDB',
    'Vue.js, Python, PyTorch, PostgreSQL',
    'Angular, Java, Spring Boot, MySQL',
    'React Native, Express.js, Redis, Docker',
    'Flutter, Firebase, Google Cloud, Kubernetes'
  ];

  const projectTitle = projects[userIndex % projects.length];
  const techStack = techStacks[userIndex % techStacks.length];

  return {
    hackathonId: hackathonId,
    title: `${projectTitle} v${userIndex}`,
    description: `🚀 **${projectTitle}** - An innovative solution developed for the hackathon

## 🎯 Project Overview
This project addresses real-world challenges using cutting-edge technology and innovative approaches. Our team has developed a comprehensive solution that demonstrates technical excellence and creative problem-solving.

## 🔧 Technical Implementation
**Tech Stack:** ${techStack}

### Key Components:
- **Frontend:** Modern, responsive user interface with intuitive design
- **Backend:** Scalable API architecture with robust data handling
- **Database:** Optimized data storage and retrieval systems
- **AI/ML:** Advanced algorithms for intelligent decision making
- **Cloud:** Deployed on scalable cloud infrastructure

## ✨ Features & Innovation
- Real-time data processing and analytics
- Machine learning-powered insights
- User-friendly interface with accessibility features
- Scalable microservices architecture
- Advanced security and privacy protection
- Cross-platform compatibility
- API integrations with third-party services

## 🎯 Problem Solving Approach
Our solution tackles the challenge through:
1. **Research & Analysis:** Deep understanding of the problem domain
2. **Design Thinking:** User-centered design methodology
3. **Agile Development:** Iterative development with continuous feedback
4. **Testing & Validation:** Comprehensive testing across multiple scenarios
5. **Optimization:** Performance tuning and resource optimization

## 📊 Impact & Results
- **Performance:** 300% improvement in processing speed
- **User Experience:** 95% user satisfaction rate
- **Scalability:** Handles 10,000+ concurrent users
- **Efficiency:** 50% reduction in resource consumption
- **Innovation:** Novel approach to existing challenges

## 🏆 Competitive Advantages
- Unique algorithmic approach
- Superior user experience design
- Robust and scalable architecture
- Comprehensive documentation
- Future-ready technology stack

## 🔮 Future Roadmap
- Enhanced AI capabilities
- Mobile application development
- Integration with emerging technologies
- Global deployment and scaling
- Community-driven feature development

This project represents our commitment to innovation, technical excellence, and solving real-world problems through technology.

---
*Developed by LoadUser${userIndex} for the hackathon challenge*`,
    repositoryUrl: `https://github.com/loaduser${userIndex}/hackathon-project-${userIndex}`,
    liveUrl: `https://loaduser${userIndex}-hackathon-demo.vercel.app`,
    videoUrl: `https://youtube.com/watch?v=demo${userIndex}${Math.random().toString(36).substr(2, 6)}`,
    isDraft: false
  };
}

// Create a test file for submission
function createTestFile(userIndex) {
  const content = `# Hackathon Project Submission - LoadUser${userIndex}

## Project Documentation

**Submitted by:** LoadUser${userIndex} Test${userIndex}
**Email:** loaduser${userIndex}@hackathontest.com
**Submission Time:** ${new Date().toISOString()}

## Project Summary
This is a comprehensive project submission for the hackathon load testing.

## Technical Details
- Architecture: Microservices
- Frontend: React with TypeScript
- Backend: Node.js with NestJS
- Database: PostgreSQL with Prisma
- Deployment: Docker containers
- Testing: Jest and Cypress

## Features Implemented
1. User authentication and authorization
2. Real-time data synchronization
3. Advanced search and filtering
4. Responsive design for all devices
5. API documentation with Swagger
6. Comprehensive error handling
7. Performance monitoring and analytics
8. Security best practices implementation

## Code Quality
- ESLint and Prettier configuration
- TypeScript for type safety
- Unit tests with 90%+ coverage
- Integration tests for API endpoints
- End-to-end tests for user workflows

## Deployment
- CI/CD pipeline with GitHub Actions
- Automated testing and deployment
- Environment-specific configurations
- Health checks and monitoring
- Scalable infrastructure setup

## Innovation
This project introduces novel approaches to common problems and demonstrates
technical excellence in implementation and design.

---
Generated for load testing purposes - User ${userIndex}
`;

  const fileName = `project-submission-loaduser${userIndex}-${Date.now()}.md`;
  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, content);
  return { filePath, fileName };
}

// HTTP request helper
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      timeout: 30000,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
    }
    
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: error.status || 0 };
  }
}

// File upload helper
async function uploadFile(token, filePath, fileName) {
  try {
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), fileName);
    
    const response = await fetch(`${BASE_URL}/uploads?folder=submissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form,
      timeout: 30000
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${data.message || response.statusText}`);
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Complete user flow: register → login → register for hackathon → submit project
async function completeUserFlow(userIndex, hackathonId) {
  const startTime = Date.now();
  const user = generateUser(userIndex);
  const userResult = {
    index: userIndex,
    email: user.email,
    userRegistration: null,
    login: null,
    hackathonRegistration: null,
    submission: null,
    fileUpload: null,
    totalTime: 0,
    errors: []
  };

  console.log(`🚀 Starting complete flow for user ${userIndex}: ${user.email}`);

  try {
    // Step 1: User Registration (if not already exists)
    console.log(`📝 Registering user ${userIndex}...`);
    const regResult = await makeRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(user)
    });

    let token = null;
    if (regResult.success) {
      results.userCreation.success++;
      userResult.userRegistration = { success: true, time: Date.now() - startTime };
      token = regResult.data.accessToken;
      console.log(`✅ User ${userIndex} registered successfully`);
    } else {
      // Try login if user already exists
      console.log(`🔄 User ${userIndex} might exist, trying login...`);
      const loginResult = await makeRequest(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      if (loginResult.success) {
        token = loginResult.data.accessToken;
        userResult.userRegistration = { success: true, time: Date.now() - startTime, note: 'Already existed' };
        console.log(`✅ User ${userIndex} logged in (already existed)`);
      } else {
        results.userCreation.failed++;
        results.userCreation.errors.push(`User ${userIndex}: ${regResult.error}`);
        userResult.userRegistration = { success: false, error: regResult.error };
        userResult.errors.push(`User registration failed: ${regResult.error}`);
        return userResult;
      }
    }

    // Step 2: Register for Hackathon
    console.log(`🎯 Registering user ${userIndex} for hackathon...`);
    const hackathonRegResult = await makeRequest(`${BASE_URL}/hackathons/${hackathonId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        selectedTrack: (userIndex % 5) + 1 // Distribute across tracks 1-5
      })
    });

    if (hackathonRegResult.success) {
      results.hackathonRegistration.success++;
      userResult.hackathonRegistration = { success: true, time: Date.now() - startTime };
      console.log(`✅ User ${userIndex} registered for hackathon`);
    } else {
      results.hackathonRegistration.failed++;
      results.hackathonRegistration.errors.push(`User ${userIndex}: ${hackathonRegResult.error}`);
      userResult.hackathonRegistration = { success: false, error: hackathonRegResult.error };
      userResult.errors.push(`Hackathon registration failed: ${hackathonRegResult.error}`);
      return userResult;
    }

    // Step 3: Create Project Submission
    console.log(`📝 Creating submission for user ${userIndex}...`);
    const submissionData = createSubmissionData(userIndex, hackathonId);
    
    const submissionResult = await makeRequest(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(submissionData)
    });

    if (submissionResult.success) {
      results.submissions.success++;
      userResult.submission = { 
        success: true, 
        time: Date.now() - startTime,
        submissionId: submissionResult.data.id,
        title: submissionResult.data.title
      };
      console.log(`✅ User ${userIndex} created submission: "${submissionResult.data.title}"`);
    } else {
      results.submissions.failed++;
      results.submissions.errors.push(`User ${userIndex}: ${submissionResult.error}`);
      userResult.submission = { success: false, error: submissionResult.error };
      userResult.errors.push(`Submission failed: ${submissionResult.error}`);
      return userResult;
    }

    // Step 4: Upload Project File
    console.log(`📁 Uploading file for user ${userIndex}...`);
    const { filePath, fileName } = createTestFile(userIndex);
    
    try {
      const uploadResult = await uploadFile(token, filePath, fileName);
      
      if (uploadResult.success) {
        userResult.fileUpload = { 
          success: true, 
          time: Date.now() - startTime,
          fileName: fileName,
          fileUrl: uploadResult.data.file.url
        };
        console.log(`✅ User ${userIndex} uploaded file: ${fileName}`);
      } else {
        userResult.fileUpload = { success: false, error: uploadResult.error };
        userResult.errors.push(`File upload failed: ${uploadResult.error}`);
        console.log(`⚠️ User ${userIndex} submission created but file upload failed: ${uploadResult.error}`);
      }
    } finally {
      // Clean up test file
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.log(`⚠️ Could not delete test file: ${filePath}`);
      }
    }

  } catch (error) {
    console.log(`💥 Unexpected error for user ${userIndex}: ${error.message}`);
    userResult.errors.push(`Unexpected error: ${error.message}`);
  }

  userResult.totalTime = Date.now() - startTime;
  return userResult;
}

// Run complete hackathon load test
async function runCompleteHackathonLoadTest() {
  console.log(`🎯 Starting COMPLETE hackathon load test with ${NUM_USERS} users`);
  console.log(`📊 Each user will: Register → Login → Join Hackathon → Submit Project → Upload File`);
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log('=' .repeat(80));

  // Get hackathon ID
  const hackathonsResponse = await fetch(`${BASE_URL}/hackathons`);
  const hackathons = await hackathonsResponse.json();
  
  if (hackathons.length === 0) {
    console.log('❌ No hackathons found! Please create a hackathon first.');
    return;
  }

  const hackathon = hackathons[0];
  console.log(`🎯 Using hackathon: "${hackathon.title}" (ID: ${hackathon.id})`);
  console.log('=' .repeat(80));

  const overallStartTime = Date.now();

  for (let batch = 0; batch < CONCURRENT_BATCHES; batch++) {
    const batchStart = batch * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, NUM_USERS);
    const batchUsers = [];

    console.log(`\n🔄 Processing batch ${batch + 1}/${CONCURRENT_BATCHES} (Users ${batchStart + 1}-${batchEnd})`);
    
    // Create promises for this batch
    for (let i = batchStart; i < batchEnd; i++) {
      batchUsers.push(completeUserFlow(i + 1, hackathon.id));
    }

    // Wait for all users in this batch to complete
    const batchResults = await Promise.allSettled(batchUsers);
    
    // Process batch results
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.userResults.push(result.value);
      } else {
        console.log(`💥 Batch ${batch + 1}, User ${batchStart + index + 1} failed: ${result.reason}`);
        results.userResults.push({
          index: batchStart + index + 1,
          email: `loaduser${batchStart + index + 1}@hackathontest.com`,
          errors: [`Batch processing failed: ${result.reason}`],
          totalTime: 0
        });
      }
    });

    console.log(`✅ Batch ${batch + 1} completed`);
    
    // Small delay between batches
    if (batch < CONCURRENT_BATCHES - 1) {
      console.log('⏳ Waiting 3 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  results.totalTime = Date.now() - overallStartTime;
  
  // Check final participant count
  await checkFinalResults(hackathon.id);
  
  // Generate comprehensive report
  generateCompleteReport();
}

// Check final results in organizer dashboard
async function checkFinalResults(hackathonId) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CHECKING ORGANIZER DASHBOARD RESULTS');
  console.log('='.repeat(80));

  try {
    // Login as first user to get token
    const loginResult = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'loaduser1@hackathontest.com',
        password: 'loadpass1231'
      })
    });

    if (!loginResult.success) {
      console.log('❌ Could not login to check results');
      return;
    }

    const token = loginResult.data.accessToken;

    // Get participants list
    const participantsResponse = await fetch(`${BASE_URL}/hackathons/${hackathonId}/participants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (participantsResponse.ok) {
      const participants = await participantsResponse.json();
      const loadTestParticipants = participants.filter(p => 
        p.user.email.includes('@hackathontest.com')
      );

      console.log(`\n📊 ORGANIZER DASHBOARD VIEW:`);
      console.log(`📋 Total participants in hackathon: ${participants.length}`);
      console.log(`🧪 Load test participants: ${loadTestParticipants.length}`);

      const withSubmissions = loadTestParticipants.filter(p => p.hasSubmission).length;
      const withoutSubmissions = loadTestParticipants.filter(p => !p.hasSubmission).length;

      console.log(`✅ Participants with submissions: ${withSubmissions}`);
      console.log(`⏳ Participants without submissions: ${withoutSubmissions}`);

      // Show sample participants
      if (loadTestParticipants.length > 0) {
        console.log(`\n👥 Sample participants (first 10):`);
        loadTestParticipants.slice(0, 10).forEach(p => {
          const status = p.hasSubmission ? '✅ Submitted' : '⏳ Not submitted';
          console.log(`   - ${p.user.firstName} ${p.user.lastName} (Track ${p.selectedTrack}): ${status}`);
        });
      }

      // Get submissions count
      const submissionsResponse = await fetch(`${BASE_URL}/submissions?hackathonId=${hackathonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (submissionsResponse.ok) {
        const submissions = await submissionsResponse.json();
        const loadTestSubmissions = submissions.filter(s => 
          s.submitter && s.submitter.email && s.submitter.email.includes('@hackathontest.com')
        );

        console.log(`\n📝 SUBMISSIONS:`);
        console.log(`📋 Total submissions: ${submissions.length}`);
        console.log(`🧪 Load test submissions: ${loadTestSubmissions.length}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error checking results: ${error.message}`);
  }
}

// Generate detailed test report
function generateCompleteReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 COMPLETE HACKATHON LOAD TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`Total Users Tested: ${NUM_USERS}`);
  console.log(`Total Test Time: ${(results.totalTime / 1000).toFixed(2)} seconds`);
  console.log(`Average Time per User: ${(results.totalTime / NUM_USERS / 1000).toFixed(2)} seconds`);
  
  console.log(`\n👤 USER CREATION:`);
  console.log(`✅ Successful: ${results.userCreation.success}/${NUM_USERS} (${((results.userCreation.success/NUM_USERS)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${results.userCreation.failed}/${NUM_USERS} (${((results.userCreation.failed/NUM_USERS)*100).toFixed(1)}%)`);
  
  console.log(`\n🎯 HACKATHON REGISTRATIONS:`);
  console.log(`✅ Successful: ${results.hackathonRegistration.success}/${NUM_USERS} (${((results.hackathonRegistration.success/NUM_USERS)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${results.hackathonRegistration.failed}/${NUM_USERS} (${((results.hackathonRegistration.failed/NUM_USERS)*100).toFixed(1)}%)`);
  
  console.log(`\n📝 PROJECT SUBMISSIONS:`);
  console.log(`✅ Successful: ${results.submissions.success}/${NUM_USERS} (${((results.submissions.success/NUM_USERS)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${results.submissions.failed}/${NUM_USERS} (${((results.submissions.failed/NUM_USERS)*100).toFixed(1)}%)`);
  
  // Performance metrics
  const successfulUsers = results.userResults.filter(u => 
    u.hackathonRegistration?.success && u.submission?.success
  );
  
  if (successfulUsers.length > 0) {
    const avgTime = successfulUsers.reduce((sum, u) => sum + u.totalTime, 0) / successfulUsers.length;
    const minTime = Math.min(...successfulUsers.map(u => u.totalTime));
    const maxTime = Math.max(...successfulUsers.map(u => u.totalTime));
    
    console.log(`\n⚡ PERFORMANCE METRICS:`);
    console.log(`Average Complete Flow Time: ${(avgTime / 1000).toFixed(2)} seconds`);
    console.log(`Fastest Complete Flow: ${(minTime / 1000).toFixed(2)} seconds`);
    console.log(`Slowest Complete Flow: ${(maxTime / 1000).toFixed(2)} seconds`);
  }
  
  // Overall assessment
  const overallSuccessRate = ((results.hackathonRegistration.success + results.submissions.success) / (NUM_USERS * 2)) * 100;
  console.log(`\n🎯 OVERALL ASSESSMENT:`);
  console.log(`Success Rate: ${overallSuccessRate.toFixed(1)}%`);
  
  if (overallSuccessRate >= 95) {
    console.log(`🎉 EXCELLENT! Your platform handles the complete hackathon flow perfectly!`);
  } else if (overallSuccessRate >= 85) {
    console.log(`👍 GOOD! Your platform performs well with minor issues.`);
  } else if (overallSuccessRate >= 70) {
    console.log(`⚠️  FAIR! Your platform has some performance issues.`);
  } else {
    console.log(`🚨 POOR! Your platform struggles with the complete flow.`);
  }

  console.log(`\n🎯 ORGANIZER IMPACT:`);
  console.log(`✅ Organizers will now see ${results.hackathonRegistration.success} participants in their dashboard`);
  console.log(`✅ ${results.submissions.success} submissions will be visible for review`);
  console.log(`✅ Real-time tracking of participant progress`);
  console.log(`✅ Complete participant management capabilities`);
  
  console.log('='.repeat(80));
}

// Run the complete test
runCompleteHackathonLoadTest().catch(error => {
  console.error('💥 Complete load test failed:', error);
  process.exit(1);
});