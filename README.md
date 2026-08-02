### Qader Academy 

---

## 🛠️ Local Environment Setup & Troubleshooting (Docker)

If you are running the project locally using Docker, please follow these steps to ensure the database and servers connect successfully:

### 1. Environment Variables Configuration
Before starting the containers, make sure you have a `.env` file in your **backend** directory with the correct MongoDB connection string:
```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
## Certificate API Contract

### GET /api/v1/certificates

**Description:**
Returns all certificates belonging to the authenticated student.

**Authentication:**
Required (JWT)

**Response:**
- 200 OK
- Array of certificates

---

### POST /api/v1/certificates

**Description:**
Issues a new certificate after successful course completion.

**Authentication:**
System only

**Response:**
- 201 Created
- Newly created certificate

---

### GET /api/v1/verify/:certificateNumber

**Description:**
Verifies a certificate using its unique certificate number.

**Authentication:**
Not required (Public)

**Response:**
- 200 OK
- Certificate information
- 404 Not Found if the certificate does not exist.