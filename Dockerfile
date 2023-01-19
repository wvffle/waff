FROM node:16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
RUN yarn install

COPY . /usr/src/app
EXPOSE 5173

RUN cd /usr/src/app/reactivity && yarn vite build && yarn link
RUN cd /usr/src/app/template-compiler && yarn vite build && yarn link
RUN cd /usr/src/app/core && yarn vite build && yarn link
RUN cd /usr/src/app/vite && yarn vite build && yarn link

CMD cd /usr/src/app/example && yarn dev --host
