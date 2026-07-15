### Qader Academy 

---

## 🛠️ Local Environment Setup & Troubleshooting (Docker)

If you are running the project locally using Docker, please follow these steps to ensure the database and servers connect successfully:

### 1. Environment Variables Configuration
Before starting the containers, make sure you have a `.env` file in your **backend** directory with the correct MongoDB connection string:
```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000