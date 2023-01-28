FROM --platform=linux/amd64 node:slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV DEBUG=puppeteer.*

RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# This instructs Docker to use this path as the default location for all
# subsequent commands. This way we do not have to type out full file paths but
# can use relative paths based on the working directory.
WORKDIR /app

# You can specify multiple src resources seperated by a comma. For example, COPY
# ["<src1>", "<src2>",..., "<dest>"].
# We copy the package.json and the package-lock.json file into our working
# directory /app.
COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci --omit=dev
# Copy our application code over to the container.
COPY . .
ENTRYPOINT ["docker-entrypoint.sh"]
# Tell Docker what command we want to run when our image is run inside of a
# container.
CMD [ "node", "src/app.js" ]
