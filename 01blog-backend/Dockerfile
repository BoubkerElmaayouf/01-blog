# Stage 1: build with Maven (Debian-based builder image)
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build
# copy maven wrapper and pom first to leverage layer caching
COPY mvnw pom.xml .
COPY .mvn .mvn
# download dependencies (cacheable)
RUN mvn -B -DskipTests dependency:go-offline


# copy sources and build
COPY src ./src
# package the application (skip tests for image build speed; run tests in CI)
RUN mvn -B -DskipTests package -DskipITs


# Stage 2: runtime using Debian slim
FROM debian:12-slim
# minimal packages: CA certs and a JRE
RUN apt-get update \
&& apt-get install -y --no-install-recommends ca-certificates openjdk-17-jre-headless \
&& rm -rf /var/lib/apt/lists/*


WORKDIR /app
# copy fat jar from builder; adjust glob if your artifact has a classifier or version
COPY --from=builder /build/target/*-SNAPSHOT.jar /app/app.jar
# If your build produces a jar without SNAPSHOT in the filename, you can use: /build/target/*.jar


# runtime settings
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"
EXPOSE 5000
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]