const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3002/api/v1';
const NUM_USERS = 70;
const CONCURRENT_BATCHES = 10; // Process users in batches to avoid overwhelming
const BATCH_SIZE = Math.ceil(NUM_USERS / CONCURRENT_BATCHES);

// Test results tracking
const results = {
  registrations: { success: 0, failed: 0, errors: [] },
  logins: { success: 0, failed: 0, errors: [] },
  submissions: { success: 0, failed: 0, errors: [] },
  totalTime: 0,
  userResults: []
};

// Generate test data
function generateUser(index) {
  return {
    firstName: `TestUser${index}`,
    lastName: `LastName${index}`,
    email: `testuser${index}@loadtest.com`,
    password: `password123${index}`
  };
}

// Create a dummy file for submission testing
function createTestFile() {
  const content = `This is a test submission file created at ${new Date().toISOString()}
  
Project Title: AI-Powered Load Test Submission
Description: This is a comprehensive test submission to validate the platform's ability to handle multiple concurrent file uploads.

Features:
- Real-time data processing
- Machine learning integration
- Scalable architecture
- User-friendly interface

Technical Stack:
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, NestJS, Prisma
- Database: PostgreSQL
- AI: OpenAI GPT integration

This submission demonstrates the platform's capability to handle concurrent operations effectively.
`;
  
  const fileName = `test-submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.txt`;
  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, content);
  return { filePath, fileName };
}

// HTTP request helper
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const response = await fetch(url, {
      timeout: 30000, // 30 second timeout
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
  const fetch = (await import('node-fetch')).default;
  const FormData = (await import('form-data')).default;
  
  try {
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

// Test a single user flow
async function testUser(userIndex) {
  const startTime = Date.now();
  const user = generateUser(userIndex);
  const userResult = {
    index: userIndex,
    email: user.email,
    registration: null,
    login: null,
    submission: null,
    totalTime: 0,
    errors: []
  };

  console.log(`🚀 Starting test for user ${userIndex}: ${user.email}`);

  try {
    // Step 1: Registration
    console.log(`📝 Registering user ${userIndex}...`);
    const regResult = await makeRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(user)
    });

    if (regResult.success) {
      results.registrations.success++;
      userResult.registration = { success: true, time: Date.now() - startTime };
      console.log(`✅ User ${userIndex} registered successfully`);
    } else {
      results.registrations.failed++;
      results.registrations.errors.push(`User ${userIndex}: ${regResult.error}`);
      userResult.registration = { success: false, error: regResult.error };
      userResult.errors.push(`Registration failed: ${regResult.error}`);
      console.log(`❌ User ${userIndex} registration failed: ${regResult.error}`);
      return userResult;
    }

    // Step 2: Login
    console.log(`🔐 Logging in user ${userIndex}...`);
    const loginResult = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    });

    let token = null;
    if (loginResult.success) {
      results.logins.success++;
      token = loginResult.data.accessToken;
      userResult.login = { success: true, time: Date.now() - startTime };
      console.log(`✅ User ${userIndex} logged in successfully`);
    } else {
      results.logins.failed++;
      results.logins.errors.push(`User ${userIndex}: ${loginResult.error}`);
      userResult.login = { success: false, error: loginResult.error };
      userResult.errors.push(`Login failed: ${loginResult.error}`);
      console.log(`❌ User ${userIndex} login failed: ${loginResult.error}`);
      return userResult;
    }

    // Step 3: File Submission
    console.log(`📁 Creating submission for user ${userIndex}...`);
    const { filePath, fileName } = createTestFile();
    
    try {
      const uploadResult = await uploadFile(token, filePath, fileName);
      
      if (uploadResult.success) {
        results.submissions.success++;
        userResult.submission = { success: true, time: Date.now() - startTime, fileName };
        console.log(`✅ User ${userIndex} submitted file successfully: ${fileName}`);
      } else {
        results.submissions.failed++;
        results.submissions.errors.push(`User ${userIndex}: ${uploadResult.error}`);
        userResult.submission = { success: false, error: uploadResult.error };
        userResult.errors.push(`Submission failed: ${uploadResult.error}`);
        console.log(`❌ User ${userIndex} submission failed: ${uploadResult.error}`);
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

// Run load test in batches
async function runLoadTest() {
  console.log(`🎯 Starting load test with ${NUM_USERS} users in ${CONCURRENT_BATCHES} batches`);
  console.log(`📊 Batch size: ${BATCH_SIZE} users per batch`);
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log('=' .repeat(80));

  const overallStartTime = Date.now();

  for (let batch = 0; batch < CONCURRENT_BATCHES; batch++) {
    const batchStart = batch * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, NUM_USERS);
    const batchUsers = [];

    console.log(`\n🔄 Processing batch ${batch + 1}/${CONCURRENT_BATCHES} (Users ${batchStart + 1}-${batchEnd})`);
    
    // Create promises for this batch
    for (let i = batchStart; i < batchEnd; i++) {
      batchUsers.push(testUser(i + 1));
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
          email: `testuser${batchStart + index + 1}@loadtest.com`,
          errors: [`Batch processing failed: ${result.reason}`],
          totalTime: 0
        });
      }
    });

    console.log(`✅ Batch ${batch + 1} completed`);
    
    // Small delay between batches to avoid overwhelming the server
    if (batch < CONCURRENT_BATCHES - 1) {
      console.log('⏳ Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  results.totalTime = Date.now() - overallStartTime;
  
  // Generate comprehensive report
  generateReport();
}

// Generate detailed test report
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 LOAD TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`Total Users Tested: ${NUM_USERS}`);
  console.log(`Total Test Time: ${(results.totalTime / 1000).toFixed(2)} seconds`);
  console.log(`Average Time per User: ${(results.totalTime / NUM_USERS / 1000).toFixed(2)} seconds`);
  
  console.log(`\n📝 REGISTRATIONS:`);
  console.log(`✅ Successful: ${results.registrations.success}/${NUM_USERS} (${((results.registrations.success/NUM_USERS)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${results.registrations.failed}/${NUM_USERS} (${((results.registrations.failed/NUM_USERS)*100).toFixed(1)}%)`);
  
  console.log(`\n🔐 LOGINS:`);
  console.log(`✅ Successful: ${results.logins.success}/${NUM_USERS} (${((results.logins.success/NUM_USERS)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${results.logins.failed}/${NUM_USERS} (${((results.logins.failed/NUM_USERS)*100).toFixed(1)}%)`);
  
  console.log(`\n📁 SUBMISSIONS:`);
  console.log(`✅ Successful: ${results.submissions.success}/${NUM_USERS} (${((results.submissions.success/NUM_USERS)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${results.submissions.failed}/${NUM_USERS} (${((results.submissions.failed/NUM_USERS)*100).toFixed(1)}%)`);
  
  // Performance metrics
  const successfulUsers = results.userResults.filter(u => u.registration?.success && u.login?.success);
  if (successfulUsers.length > 0) {
    const avgTime = successfulUsers.reduce((sum, u) => sum + u.totalTime, 0) / successfulUsers.length;
    const minTime = Math.min(...successfulUsers.map(u => u.totalTime));
    const maxTime = Math.max(...successfulUsers.map(u => u.totalTime));
    
    console.log(`\n⚡ PERFORMANCE METRICS:`);
    console.log(`Average User Flow Time: ${(avgTime / 1000).toFixed(2)} seconds`);
    console.log(`Fastest User Flow: ${(minTime / 1000).toFixed(2)} seconds`);
    console.log(`Slowest User Flow: ${(maxTime / 1000).toFixed(2)} seconds`);
  }
  
  // Error analysis
  if (results.registrations.errors.length > 0) {
    console.log(`\n❌ REGISTRATION ERRORS:`);
    results.registrations.errors.slice(0, 10).forEach(error => console.log(`   ${error}`));
    if (results.registrations.errors.length > 10) {
      console.log(`   ... and ${results.registrations.errors.length - 10} more errors`);
    }
  }
  
  if (results.logins.errors.length > 0) {
    console.log(`\n❌ LOGIN ERRORS:`);
    results.logins.errors.slice(0, 10).forEach(error => console.log(`   ${error}`));
    if (results.logins.errors.length > 10) {
      console.log(`   ... and ${results.logins.errors.length - 10} more errors`);
    }
  }
  
  if (results.submissions.errors.length > 0) {
    console.log(`\n❌ SUBMISSION ERRORS:`);
    results.submissions.errors.slice(0, 10).forEach(error => console.log(`   ${error}`));
    if (results.submissions.errors.length > 10) {
      console.log(`   ... and ${results.submissions.errors.length - 10} more errors`);
    }
  }
  
  // Overall assessment
  const overallSuccessRate = ((results.registrations.success + results.logins.success + results.submissions.success) / (NUM_USERS * 3)) * 100;
  console.log(`\n🎯 OVERALL ASSESSMENT:`);
  console.log(`Success Rate: ${overallSuccessRate.toFixed(1)}%`);
  
  if (overallSuccessRate >= 95) {
    console.log(`🎉 EXCELLENT! Your platform handles concurrent load very well.`);
  } else if (overallSuccessRate >= 85) {
    console.log(`👍 GOOD! Your platform performs well under load with minor issues.`);
  } else if (overallSuccessRate >= 70) {
    console.log(`⚠️  FAIR! Your platform has some performance issues under load.`);
  } else {
    console.log(`🚨 POOR! Your platform struggles significantly under concurrent load.`);
  }
  
  // Save detailed results to file
  const reportData = {
    summary: {
      totalUsers: NUM_USERS,
      totalTime: results.totalTime,
      overallSuccessRate: overallSuccessRate
    },
    results: results,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('load-test-results.json', JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed results saved to: load-test-results.json`);
  console.log('='.repeat(80));
}

// Install required dependencies and run test
async function main() {
  try {
    // Check if node-fetch is available
    try {
      await import('node-fetch');
    } catch (e) {
      console.log('📦 Installing required dependencies...');
      const { execSync } = require('child_process');
      execSync('npm install node-fetch@2 form-data', { stdio: 'inherit' });
    }
    
    await runLoadTest();
  } catch (error) {
    console.error('💥 Load test failed:', error);
    process.exit(1);
  }
}

// Run the test
main();