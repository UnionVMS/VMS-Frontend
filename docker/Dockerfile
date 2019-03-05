FROM node:10-alpine

# Setup angular cli
RUN npm install -g @angular/cli

# Add bash
RUN apk add --no-cache bash
COPY docker/.bashrc /root/.bashrc

# Prepare app directory
RUN mkdir -p /app
WORKDIR /app/


EXPOSE 4200
CMD [ "npm", "start" ]
