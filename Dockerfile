FROM node:current-alpine

ENV GreenBG="\\033[42;37m" \
    Font="\\033[0m" \
    Info="${Green}[信息]${Font}" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY ./fonts/wqy-microhei.ttc /usr/share/fonts/wqy-microhei.ttc

RUN apk -U --no-cache update \
    && apk -U --no-cache upgrade \
    && apk -U --no-cache --allow-untrusted add git chromium nss freetype harfbuzz ca-certificates ttf-freefont \
    && git config --global --add safe.directory '*' \
    && rm -rf /var/cache/*

WORKDIR /app

RUN git clone --depth=1 --branch master https://gitee.com/Le-niao/Yunzai-Bot.git \
    && cd ./Yunzai-Bot \
    && npm install

WORKDIR /app/Yunzai-Bot

COPY docker-entrypoint.sh entrypoint.sh

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]