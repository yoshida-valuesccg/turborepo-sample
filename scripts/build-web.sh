#!/bin/bash

docker build -t web . -f dockerfiles/Dockerfile.web

docker run -d -p 8080:80 web
