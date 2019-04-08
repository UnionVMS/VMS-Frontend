FROM node:10-alpine

# Setup angular cli
RUN npm install -g @angular/cli

# Add bash
RUN apk add --no-cache bash
COPY docker/.bashrc /root/.bashrc

# Installs latest Chromium package.
RUN apk add --no-cache \
    chromium \
    && rm -rf /var/cache/* \
    && mkdir /var/cache/apk

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

# Prepare app directory
RUN mkdir -p /app
WORKDIR /app/


EXPOSE 4200
CMD [ "npm", "start" ]
