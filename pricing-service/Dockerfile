# Not built as part of scaffolding this project.
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir grpcio grpcio-tools protobuf
EXPOSE 50052
CMD ["python", "server.py"]
