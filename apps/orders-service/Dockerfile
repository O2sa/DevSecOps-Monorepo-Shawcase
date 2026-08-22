# ==============================================================================
# Multi-stage Dockerfile for Spring Boot Orders Service
# ==============================================================================

# 1. Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

COPY pom.xml ./
# Pre-fetch dependencies
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# 2. Production runner stage
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

ENV SERVER_PORT=8002

# Security: Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=builder --chown=spring:spring /build/target/*.jar /app/app.jar

USER spring

EXPOSE 8002

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
