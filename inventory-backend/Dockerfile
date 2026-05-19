# Build stage
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies to cache them in the Docker layer
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Run stage
FROM openjdk:17-slim
WORKDIR /app

# Security Hardening: Run as a non-privileged system user
RUN groupadd -r spring && useradd -r -g spring spring
COPY --from=build --chown=spring:spring /app/target/inventory_management-0.0.1-SNAPSHOT.jar app.jar

USER spring:spring

ENV PORT=8080
EXPOSE 8080

# Production Healthcheck for Container Orchestrators (Render/Docker Swarm)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:8080/actuator/health || exit 1

# JVM memory configurations optimized for cloud resource limits (e.g. Render Free Tier's 512MB RAM)
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-Dserver.port=${PORT}", "-jar", "app.jar"]
