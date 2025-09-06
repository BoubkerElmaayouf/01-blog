#!/bin/bash

# Exit on error
set -e

BACKEND_DIR="./01blog-backend"
FRONTEND_DIR="./01blog-frontend"

echo "🚀 Starting 01Blog Project..."

# Open backend in new terminal
echo "➡️ Opening backend (Spring Boot) in new terminal..."
gnome-terminal -- bash -c "cd $BACKEND_DIR && ./mvnw spring-boot:run; exec bash"

# Open frontend in new terminal
echo "➡️ Opening frontend (Angular) in new terminal..."
gnome-terminal -- bash -c "cd $FRONTEND_DIR && ng serve --open; exec bash"
