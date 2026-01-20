#!/bin/bash

API_BASE="http://localhost:3002/api/v1"
HACKATHON_1="3d84ab39-c7d9-463a-a3fc-ebdf7c8c4a2d"  # gccX
HACKATHON_2="74de72c9-658d-4589-8f28-bfccf2578925"  # gcc

echo "🚀 Creating submissions for registered participants..."

# Login participants and create submissions
for i in {1..3}; do
    echo "Logging in participant $i..."
    
    LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"testparticipant$i@example.com\",
            \"password\": \"password123\"
        }")
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
        echo "✅ Logged in participant $i"
        
        # Create submissions for both hackathons
        for HACKATHON_ID in "$HACKATHON_1" "$HACKATHON_2"; do
            echo "Creating submission for participant $i in hackathon $HACKATHON_ID..."
            
            SUBMISSION_DATA="{
                \"hackathonId\": \"$HACKATHON_ID\",
                \"title\": \"Amazing Project $i by Test$i Participant\",
                \"description\": \"This is a comprehensive project submission for hackathon $HACKATHON_ID.\\n\\nThe project demonstrates innovative solutions using cutting-edge technology. Key features include:\\n- Advanced AI integration\\n- Real-time data processing\\n- User-friendly interface\\n- Scalable architecture\\n- Security best practices\\n\\nThis submission represents hours of dedicated work and creative problem-solving.\",
                \"techStack\": \"React, Node.js, MongoDB, AI/ML, Docker\",
                \"repositoryUrl\": \"https://github.com/testparticipant$i/hackathon-project-$i\",
                \"files\": [
                    \"{\\\"name\\\": \\\"project-$i-source.zip\\\", \\\"url\\\": \\\"http://localhost:3002/api/v1/uploads/submissions/$HACKATHON_ID/project-$i-source.zip\\\", \\\"size\\\": 2621440, \\\"type\\\": \\\"application/zip\\\"}\",
                    \"{\\\"name\\\": \\\"presentation-$i.pdf\\\", \\\"url\\\": \\\"http://localhost:3002/api/v1/uploads/submissions/$HACKATHON_ID/presentation-$i.pdf\\\", \\\"size\\\": 5452595, \\\"type\\\": \\\"application/pdf\\\"}\"
                ],
                \"isDraft\": false
            }"
            
            SUB_RESPONSE=$(curl -s -X POST "$API_BASE/submissions" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $TOKEN" \
                -d "$SUBMISSION_DATA")
            
            if echo "$SUB_RESPONSE" | grep -q "id"; then
                echo "✅ Created submission for participant $i in hackathon $HACKATHON_ID"
            else
                echo "❌ Failed to create submission for participant $i"
                echo "Response: $SUB_RESPONSE"
            fi
        done
    else
        echo "❌ Failed to login participant $i"
    fi
done

echo ""
echo "🎉 Submission creation completed!"
echo "✅ tusharsraj02@gmail.com should now see submissions in the review section!"