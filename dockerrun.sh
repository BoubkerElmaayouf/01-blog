#!/bin/bash

echo "Checking if Docker is installed..."
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please install Docker first."
  exit 1
fi

echo "Installing Postgres Docker image (postgres:15)..."
if [[ "$(docker images -q postgres:15 2> /dev/null)" == "" ]]; then
  docker pull postgres:15
  echo "Postgres image pulled successfully."
else
  echo "Postgres image already exists."
fi

# Check if a container named 'my-postgres' already exists
CONTAINER_ID=$(docker ps -a -q -f name=my-postgres)

if [[ -n "$CONTAINER_ID" ]]; then
  echo "A container named 'my-postgres' already exists. Removing it..."
  docker rm -f "$CONTAINER_ID"
  echo "Old container removed."
fi

# Check if any Postgres process is running
POSTGRES_RUNNING=$(docker ps -q -f ancestor=postgres:15)

if [[ -n "$POSTGRES_RUNNING" ]]; then
  echo "A Postgres container is running. Stopping and removing it..."
  docker rm -f "$POSTGRES_RUNNING"
  echo "Old Postgres container stopped and removed."
fi

echo "Starting new Postgres container..."
docker run -d \
  --name my-postgres \
  -e POSTGRES_USER=01blog \
  -e POSTGRES_PASSWORD=blog123 \
  -e POSTGRES_DB=01blog \
  -p 5432:5432 \
  postgres:15

if [[ $? -eq 0 ]]; then
  echo "Postgres container started successfully!"
else
  echo "Failed to start Postgres container."
  exit 1
fi

# # Wait a few seconds for Postgres to fully start
# echo "Waiting for Postgres to be ready..."
# sleep 5

# # Create SQL commands for table creation and admin insertion
# SQL=$(cat <<EOF
# CREATE TABLE IF NOT EXISTS users (
#     id SERIAL PRIMARY KEY,
#     first_name VARCHAR(255),
#     last_name VARCHAR(255),
#     email VARCHAR(255) UNIQUE NOT NULL,
#     bio TEXT,
#     password VARCHAR(255),
#     role VARCHAR(50),
#     banned BOOLEAN DEFAULT FALSE,
#     profile_pic VARCHAR(255),
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );

# INSERT INTO users (first_name, last_name, email, password, role, banned)
# VALUES ('Admin', '1', 'a@a.com', 'a@a.com', 'ADMIN', FALSE)
# ON CONFLICT (email) DO NOTHING;
# EOF
# )

# # Execute SQL inside the container
# echo "Initializing database..."
# docker exec -i my-postgres psql -U 01blog -d 01blog -c "$SQL"

# if [[ $? -eq 0 ]]; then
#   echo "Admin user created successfully!"
# else
#   echo "Failed to create admin user."
#   exit 1
# fi
