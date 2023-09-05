FROM --platform=linux/arm64 node:18.14-alpine
LABEL maintainer="ethan"

WORKDIR /home/node
USER node
EXPOSE 3000

COPY --chown=node package.json yarn.lock ./
RUN yarn install
COPY --chown=node . ./

CMD node bin/www.js 2>&1 | tee ./logs/app.log
