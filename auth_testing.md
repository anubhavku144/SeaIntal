# Authentication Testing Playbook

## Step 1: MongoDB Verification
- Database: `oil_spill_maritime_db`
- Collections: `users`, `login_attempts`, `detections`, `vessels`, `alerts`, `reports`

## Step 2: API Testing
```bash
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@maritime.gov","password":"admin_maritime_2026"}'
curl -b cookies.txt http://localhost:8001/api/auth/me
```
