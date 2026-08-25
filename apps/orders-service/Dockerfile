# ==============================================================================
# Multi-stage Dockerfile for Spring Boot Orders Service (Java 21 / Maven)
# ==============================================================================

# 1. Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

COPY src ./src
RUN mvn clean package -DskipTests -B

# 2. Production runtime stage
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

ENV SERVER_PORT=8002
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"

# Security: Run as non-root user
RUN addgroup -S appgroup -g 1001 && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser

EXPOSE 8002

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
