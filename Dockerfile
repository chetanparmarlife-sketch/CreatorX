# Use Eclipse Temurin JDK 17 for building
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /workspace/app

# Copy Gradle wrapper and build files
COPY backend/gradle backend/gradle
COPY backend/gradlew backend/gradlew
COPY backend/gradle.properties backend/gradle.properties
COPY backend/settings.gradle backend/settings.gradle
COPY backend/build.gradle backend/build.gradle

# Copy all module build files
COPY backend/creatorx-common/build.gradle backend/creatorx-common/build.gradle
COPY backend/creatorx-repository/build.gradle backend/creatorx-repository/build.gradle
COPY backend/creatorx-service/build.gradle backend/creatorx-service/build.gradle
COPY backend/creatorx-api/build.gradle backend/creatorx-api/build.gradle

# Copy source code
COPY backend/creatorx-common/src backend/creatorx-common/src
COPY backend/creatorx-repository/src backend/creatorx-repository/src
COPY backend/creatorx-service/src backend/creatorx-service/src
COPY backend/creatorx-api/src backend/creatorx-api/src

# Build the application
WORKDIR /workspace/app/backend
RUN ./gradlew clean build -x test --no-daemon

# Debug: List the JAR files to verify they exist
RUN ls -la creatorx-api/build/libs/

# Extract the built JAR (use the non-plain JAR file)
RUN mkdir -p target && \
    cp creatorx-api/build/libs/creatorx-api-1.0.0.jar target/app.jar

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built JAR from build stage
COPY --from=build /workspace/app/backend/target/app.jar app.jar

# JVM settings for Railway (512MB RAM)
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
