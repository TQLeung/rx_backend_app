#!/bin/bash
echo 'docker is startting to work...'

version=$(git log -1 --pretty=%h)
echo version: ${version}
docker buildx build --platform linux/arm64v8 -t betterethan/renxin-cloud-api:${version} .
echo 'docker build finished...'
docker push betterethan/renxin-cloud-api:${version}
echo 'docker push finished...'
# docker rmi betterethan/renxin-cloud-api:${version}

echo The image is pushed
