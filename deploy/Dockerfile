FROM eclipse-temurin:21-jre
WORKDIR /app
COPY backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
RUN mkdir -p /app/data && chown 10001 /app/data
USER 10001
EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]
