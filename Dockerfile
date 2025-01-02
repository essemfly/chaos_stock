# 빌드 스테이지
ARG BUN_VERSION=1.1.13
ARG NODE_VERSION=21.5.0
FROM imbios/bun-node:${BUN_VERSION}-${NODE_VERSION}-slim as builder

WORKDIR /app

# 소스 코드 복사
COPY package.json bun.lockb ./
COPY . .

# prisma generate (필요한 경우)
RUN bunx prisma generate

# 의존성 설치 및 빌드
RUN bun install --frozen-lockfile
RUN bun run build

# 프로덕션 스테이지
FROM oven/bun:1-slim

WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma


# 프로덕션 의존성만 설치
RUN bun install --frozen-lockfile --production

# 폰트 설치
RUN apt-get update && apt-get install -y fonts-nanum

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# 포트 노출
EXPOSE 3000

# 앱 실행
CMD ["bun", "run", "start"]