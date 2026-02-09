# Build stage
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copy Gradle files from backend directory
COPY backend/build.gradle backend/settings.gradle backend/gradle.properties ./
COPY backend/gradle ./gradle

# Copy all module source files
COPY backend/creatorx-api ./creatorx-api
COPY backend/creatorx-service ./creatorx-service
COPY backend/creatorx-repository ./creatorx-repository
COPY backend/creatorx-common ./creatorx-common

# Build the application
RUN gradle clean build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built JAR from build stage
COPY --from=build /app/creatorx-api/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check - increased start period for Railway deployment
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application with optimized JVM settings for Railway
ENTRYPOINT ["java", \
    "-Xms256m", \
    "-Xmx512m", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", \
    "app.jar"]
