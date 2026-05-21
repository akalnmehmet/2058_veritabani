#!/bin/sh
set -e

echo "Veritabanı migrasyonları uygulanıyor..."
alembic upgrade head

echo "Sunucu başlatılıyor..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
