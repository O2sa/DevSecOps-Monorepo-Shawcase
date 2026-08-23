# ==============================================================================
# Production Dockerfile for Spring Boot Orders Service
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

ENV SERVER_PORT=8002

# Security: Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

COPY --chown=spring:spring target/*.jar /app/app.jar

USER spring

EXPOSE 8002

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
