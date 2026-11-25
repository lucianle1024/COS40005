# syntax=docker/dockerfile:1

# Frontend build
FROM node:24-alpine AS frontend-build
WORKDIR /frontend
COPY src/frontend/package.json src/frontend/package-lock.json ./
RUN npm ci
COPY src/frontend/ .
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Static frontend runtime
FROM nginx:alpine AS frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html
EXPOSE 80

# Backend runtime
FROM python:3.13-slim AS backend
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY src/backend/pyproject.toml src/backend/constraints.txt ./
COPY src/backend/app ./src/backend/app
COPY data ./data
RUN pip install --no-cache-dir -c constraints.txt . \
    && addgroup --system app \
    && adduser --system --ingroup app --home /app app \
    && mkdir -p /app/var \
    && chown -R app:app /app
USER app
ENV PYTHONPATH=/app/src/backend \
    SOC_SESSION_DATABASE=/app/var/investigation-sessions.sqlite3
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
