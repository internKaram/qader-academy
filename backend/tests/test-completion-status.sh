#!/usr/bin/env bash
# Test sequence for GET /api/v1/progress/:courseId/completion-status
# Uses the seeded student Sabrin Alqarni (sabrin@qader.com).
#
# Prerequisites:
#   - Backend running locally (default: http://localhost:5000)
 

set -e
BASE_URL="http://localhost:5000/api/v1"
COURSE_ID="REPLACE_WITH_REAL_COURSE_ID"
LESSON_ID="REPLACE_WITH_REAL_LESSON_ID"
 
echo "== 0. (Manual) Find a real course + lesson id first =="
echo "   mongosh qader_academy_dev --eval 'db.courses.findOne()'"
echo "   mongosh qader_academy_dev --eval 'db.lessons.findOne({ course: ObjectId(\"<courseId>\") })'"
echo ""
 
echo "== 1. Log in as sabrin@qader.com to get a JWT =="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"sabrin@qader.com","password":"Student@123"}')
 
echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
STUDENT_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo "Student ID: $STUDENT_ID"
echo ""
 
echo "== 2. Enroll in the test course =="
curl -s -X POST "$BASE_URL/enrollments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"courseId\":\"$COURSE_ID\"}"
echo ""
echo ""
 
echo "== 3. Mark the lesson complete =="
curl -s -X POST "$BASE_URL/progress" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"courseId\":\"$COURSE_ID\",\"lessonId\":\"$LESSON_ID\"}"
echo ""
echo ""
 
echo "== 4. Check completion status =="
curl -s -X GET "$BASE_URL/progress/$COURSE_ID/completion-status?student=$STUDENT_ID" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""
echo "Expected if this course only has 1 lesson: allLessonsComplete: true"
echo "If the course has multiple lessons, repeat step 3 for each lessonId first."