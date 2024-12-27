#!/bin/bash

# lambda function
docker build -t hello-world . -f dockerfiles/Dockerfile.hello-world

# test run lambda function
docker run -p 9000:8080 hello-world:latest

# test lambda function
# curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
