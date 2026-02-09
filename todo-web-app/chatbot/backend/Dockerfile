# Use a Python base image
FROM python:3.11-slim

# Install system dependencies needed for psycopg2-binary
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    musl-dev \
    libpq-dev \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (Render will set the PORT environment variable)
EXPOSE $PORT

# Run the application with uvicorn, using Render's PORT environment variable
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]