#!/bin/bash

API_BASE="http://localhost:3002/api/v1"
HACKATHON_1="3d84ab39-c7d9-463a-a3fc-ebdf7c8c4a2d"  # gccX
HACKATHON_2="74de72c9-658d-4589-8f28-bfccf2578925"  # gcc

echo "🚀 Creating test data for tusharsraj02@gmail.com organizer account..."

# Create participants and get their tokens
declare -a PARTICIPANTS
declare -a TOKENS

for i in {1..5}; do
    echo "Creating participant $i..."
    
    RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"testparticipant$i@example.com\",
            \"password\": \"password123\",
            \"firstName\": \"Test$i\",
            \"lastName\": \"Participant\",
            \"role\": \"PARTICIPANT\"
        }")
    
    if echo "$RESPONSE" | grep -q "accessToken"; then
        TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
        USER_ID=$(echo "$RESPONSE" | jq -r '.user.id')
        PARTICIPANTS[$i]="$USER_ID"
        TOKENS[$i]="$TOKEN"
        echo "✅ Created participant: testparticipant$i@example.com"
    else
        echo "ℹ️  Participant might already exist, trying login..."
        LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\": \"testparticipant$i@example.com\",
                \"password\": \"password123\"
            }")
        
        if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
            TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
            USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')
            PARTICIPANTS[$i]="$USER_ID"
            TOKENS[$i]="$TOKEN"
            echo "✅ Logged in existing participant: testparticipant$i@example.com"
        else
            echo "❌ Failed to create/login participant $i"
        fi
    fi
done

echo ""
echo "📊 Processing hackathons..."

# Process each hackathon
for HACKATHON_ID in "$HACKATHON_1" "$HACKATHON_2"; do
    echo "🎯 Processing hackathon: $HACKATHON_ID"
    
    for i in {1..5}; do
        if [ -n "${TOKENS[$i]}" ]; then
            echo "Registering participant $i for hackathon..."
            
            # Register for hackathon
            REG_RESPONSE=$(curl -s -X POST "$API_BASE/hackathons/$HACKATHON_ID/register" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer ${TOKENS[$i]}" \
                -d "{}")
            
            if echo "$REG_RESPONSE" | grep -q "success\|registered"; then
                echo "✅ Registered participant $i for hackathon $HACKATHON_ID"
            else
                echo "ℹ️  Participant $i might already be registered"
            fi
            
            # Create submission for first 3 participants
            if [ $i -le 3 ]; then
                echo "Creating submission for participant $i..."
                
                SUBMISSION_DATA="{
                    \"hackathonId\": \"$HACKATHON_ID\",
                    \"title\": \"Amazing Project $i by Test$i Participant\",
                    \"description\": \"This is a comprehensive project submission for hackathon $HACKATHON_ID. The project demonstrates innovative solutions using cutting-edge technology.\",
                    \"techStack\": \"React, Node.js, MongoDB, AI/ML, Docker\",
                    \"repositoryUrl\": \"https://github.com/testparticipant$i/hackathon-project-$i\",
                    \"selectedTrack\": $((($i % 3) + 1)),
                    \"files\": [
                        \"{\\\"name\\\": \\\"project-$i-source.zip\\\", \\\"url\\\": \\\"http://localhost:3002/api/v1/uploads/submissions/$HACKATHON_ID/project-$i-source.zip\\\", \\\"size\\\": 2621440, \\\"type\\\": \\\"application/zip\\\"}\",
                        \"{\\\"name\\\": \\\"presentation-$i.pdf\\\", \\\"url\\\": \\\"http://localhost:3002/api/v1/uploads/submissions/$HACKATHON_ID/presentation-$i.pdf\\\", \\\"size\\\": 5452595, \\\"type\\\": \\\"application/pdf\\\"}\"
                    ],
                    \"isDraft\": false
                }"
                
                SUB_RESPONSE=$(curl -s -X POST "$API_BASE/submissions" \
                    -H "Content-Type: application/json" \
                    -H "Authorization: Bearer ${TOKENS[$i]}" \
                    -d "$SUBMISSION_DATA")
                
                if echo "$SUB_RESPONSE" | grep -q "id"; then
                    echo "✅ Created submission for participant $i"
                else
                    echo "❌ Failed to create submission for participant $i"
                    echo "Response: $SUB_RESPONSE"
                fi
            fi
        fi
    done
done

echo ""
echo "🎉 Test data creation completed!"
echo "✅ tusharsraj02@gmail.com should now see both participants and submissions!"