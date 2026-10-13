FROM gradle:9.6.0-jdk25 AS build
WORKDIR /workspace
COPY . .
ARG SERVICE_PROJECT
ARG BOOT_MODULE
ARG ARTIFACT_PATH
RUN ./gradlew -p "${SERVICE_PROJECT}" ":${BOOT_MODULE}:bootJar" --no-daemon \
    && find "${ARTIFACT_PATH}" -type f -name '*.jar' ! -name '*-plain.jar' -exec cp '{}' /workspace/application.jar \;

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /workspace/application.jar /app/application.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/application.jar"]
