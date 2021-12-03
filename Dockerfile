FROM node:lts-alpine as builder

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install

COPY . /app

RUN yarn build

FROM nginx:alpine

MAINTAINER jsclndnz@gmail.com

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .

EXPOSE 80
