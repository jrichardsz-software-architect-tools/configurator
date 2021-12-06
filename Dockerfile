FROM node:10

RUN mkdir /app
WORKDIR /app
COPY . /app
RUN rm -rf /app/test
RUN npm install

CMD ["npm","run","start"]
