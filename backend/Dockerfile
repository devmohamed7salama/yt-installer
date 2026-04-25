FROM node:18-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deno.land/install.sh | sh && \
    ln -s /root/.deno/bin/deno /usr/bin/deno

RUN pip3 install yt-dlp --break-system-packages && \
    ln -s /usr/local/bin/yt-dlp /usr/bin/yt-dlp && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "src/index.js"]