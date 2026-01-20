#!/bin/bash

API_BASE="http://localhost:3002/api/v1"
HACKATHON_1="3d84ab39-c7d9-463a-a3fc-ebdf7c8c4a2d"  # gccX
HACKATHON_2="74de72c9-658d-4589-8f28-bfccf2578925"  # gcc

echo "🚀 Adding load test submissions to show more in review section..."

# Add submissions from load test users
for i in {1..10}; do
    echo "Creating submission from loaduser$i..."
    
    LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"loaduser$i@hackathontest.com\",
            \"password\": \"loadpass123$i\"
        }")
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
        echo "✅ Logged in loaduser$i"
        
        # Create submission for gccX hackathon
        SUBMISSION_DATA="{
            \"hackathonId\": \"$HACKATHON_1\",
            \"title\": \"AI-Powered Project $i by LoadUser$i\",
            \"description\": \"Advanced AI project submission with machine learning capabilities and innovative features.\",
            \"techStack\": \"React, Node.js, TensorFlow, MongoDB, Docker\",
            \"repositoryUrl\": \"https://github.com/loaduser$i/ai-project-$i\",
            \"files\": [
                \"{\\\"name\\\": \\\"ai-project-$i.zip\\\", \\\"url\\\": \\\"http://localhost:3002/api/v1/uploads/submissions/$HACKATHON_1/ai-project-$i.zip\\\", \\\"size\\\": 3145728, \\\"type\\\": \\\"application/zip\\\"}\",
                \"{\\\"name\\\": \\\"demo-$i.pdf\\\", \\\"url\\\": \\\"http://localhost:3002/api/v1/uploads/submissions/$HACKATHON_1/demo-$i.pdf\\\", \\\"size\\\": 2097152, \\\"type\\\": \\\"application/pdf\\\"}\"
            ],
            \"isDraft\": false
        }"
        
        SUB_RESPONSE=$(curl -s -X POST "$API_BASE/submissions" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$SUBMISSION_DATA")
        
        if echo "$SUB_RESPONSE" | grep -q "id"; then
            echo "✅ Created submission for loaduser$i"
        else
            echo "❌ Failed to create submission for loaduser$i"
        fi
    else
        echo "❌ Failed to login loaduser$i"
    fi
done

echo ""
echo "🎉 Added more submissions for review!"