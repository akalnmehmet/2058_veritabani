@echo off
echo ========================================================
echo Tumen Aluminyum - Uygulama Baslatiliyor...
echo ========================================================

echo Backend baslatiliyor...
cd backend
if not exist "venv\Scripts\activate" (
    echo Venv bulunamadi! Lutfen once kurulumu yapin: python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    pause
    exit /b
)
start "Backend Sunucusu" cmd /k "venv\Scripts\activate && uvicorn app.main:app --reload"

cd ..

echo Frontend baslatiliyor...
cd frontend
if not exist "node_modules" (
    echo Node modules bulunamadi! npm install calistiriliyor...
    call npm install
)
start "Frontend Sunucusu" cmd /k "npm run dev"

cd ..
echo ========================================================
echo İki terminal penceresi acildi.
echo Frontend genelde http://localhost:5173 adresinde calisir.
echo Backend http://localhost:8000 adresinde calisir.
echo ========================================================
