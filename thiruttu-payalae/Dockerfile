FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml ./
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/movies-mcp-server-1.0.0-jar-with-dependencies.jar ./movies-mcp-server.jar

EXPOSE 10000

CMD ["sh", "-c", "java -jar /app/movies-mcp-server.jar --web-host=0.0.0.0 --web-port=${PORT:-10000}"]
