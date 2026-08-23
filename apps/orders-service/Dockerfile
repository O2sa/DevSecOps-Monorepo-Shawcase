# ==============================================================================
# Multi-stage Dockerfile for Spring Boot Orders Service
# ==============================================================================

# 1. Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

ENV MAVEN_OPTS="-Djava.net.preferIPv4Stack=true -Dmaven.wagon.http.retryHandler.count=5 -Dmaven.wagon.http.retryHandler.requestSentRetryEnabled=true"

COPY pom.xml ./
COPY src ./src

RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -B

# 2. Production runner stage
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

ENV SERVER_PORT=8002

# Security: Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Copy generated JAR from builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar /app/app.jar

USER spring

EXPOSE 8002

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
