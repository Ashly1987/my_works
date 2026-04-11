FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY . .
RUN set -eux; \
		mkdir -p /out; \
		if [ -f pom.xml ]; then \
			mvn -q -DskipTests package; \
			cp target/movies-mcp-server-1.0.0-jar-with-dependencies.jar /out/movies-mcp-server.jar; \
		elif [ -f thiruttu-payalae/pom.xml ]; then \
			cd thiruttu-payalae; \
			mvn -q -DskipTests package; \
			cp target/movies-mcp-server-1.0.0-jar-with-dependencies.jar /out/movies-mcp-server.jar; \
		else \
			echo "pom.xml not found in Docker context"; \
			exit 1; \
		fi

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /out/movies-mcp-server.jar ./movies-mcp-server.jar

EXPOSE 10000

CMD ["sh", "-c", "java -jar /app/movies-mcp-server.jar --web-host=0.0.0.0 --web-port=${PORT:-10000}"]
