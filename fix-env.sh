#!/bin/bash

# Helper script to update DATABASE_URL in .env file

ENV_FILE="apps/api/.env"

echo "Updating DATABASE_URL in $ENV_FILE..."

# Backup the original
cp "$ENV_FILE" "$ENV_FILE.backup"

# Update DATABASE_URL line
sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="postgresql://vetcare_user:vetcare_password@localhost:5432/vetcare_db"|' "$ENV_FILE"

echo "✅ DATABASE_URL updated!"
echo "Backup saved to $ENV_FILE.backup"
echo ""
echo "Updated connection string:"
grep "DATABASE_URL" "$ENV_FILE"
