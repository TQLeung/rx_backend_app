FROM --platform=linux/arm64/v8 node:18.14-alpine
LABEL maintainer="ethan"

WORKDIR /home/node
USER node
EXPOSE 3000

COPY --chown=node package.json yarn.lock ./
RUN yarn install
COPY --chown=node . ./

CMD node task/index.js 2>&1 | tee ./logs/task.log
