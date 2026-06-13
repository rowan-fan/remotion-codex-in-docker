FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    bash \
    procps \
    ffmpeg \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    libnss3 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g @openai/codex

ENV NODE_ENV=development
ENV REMOTION_DISABLE_UPDATE_CHECK=1
ENV npm_config_update_notifier=false

WORKDIR /workspace

CMD ["bash", "-lc", "tail -f /dev/null"]
