# Multi-stage build for FastAPI backend
# Stage 1: Install system dependencies and Python packages
FROM python:3.11-slim AS builder
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production server
FROM python:3.11-slim AS runner
WORKDIR /app

# Create non-root user
RUN groupadd -g 1001 -r appuser && \
    useradd -u 1001 -r -g appuser appuser

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder stage
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY ./src ./src

# Change ownership to non-root user
RUN chown -R appuser:appuser /app
RUN chown -R appuser:appuser /root/.local

USER appuser

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]