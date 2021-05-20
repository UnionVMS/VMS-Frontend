FROM node:14-alpine

# Setup angular cli
RUN npm install -g @angular/cli ngx-i18nsupport

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
EXPOSE 9876
CMD [ "npm", "start" ]
# CMD tail -f /dev/null
