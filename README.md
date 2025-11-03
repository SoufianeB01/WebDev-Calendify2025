Docker:
- docker compose up -d
- docker compose down
- docker ps
- docker compose up -d --build

.NET:
- dotnet run
- dotnet build
- dotnet ef migrations add <Name>
- dotnet ef database update




To run backend:
- cd backend
- cd CalendifyWebAppAPI
- dotnet run

To run frontend:
- cd frontend
- cd calendify-app
- npm install (for first time run)
- npm start

To test create user and login in backend/CalendifyWebAppAPI/CreateTestUser.http with send request

test
http://localhost:5143/swagger/index.html
http://localhost:3000/
