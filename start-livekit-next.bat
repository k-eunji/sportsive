@echo off
REM =====================================================
REM Windows용 LiveKit + Next.js 자동 실행 배치 파일
REM =====================================================

REM 1️⃣ 기존 LiveKit 컨테이너 제거
echo 🔹 기존 LiveKit 컨테이너 제거 중...
docker rm -f livekit 2>nul

REM 2️⃣ LiveKit 서버 실행
echo 🔹 LiveKit 서버 실행...
start "" cmd /k "docker run --name livekit -p 7880:7880 -p 7881:7881 -p 50000-50010:50000-50010/udp -e ""LIVEKIT_KEYS=devkey: mysuperlongsecretkeythatis32charsmin"" livekit/livekit-server"

REM 3️⃣ Next.js 개발 서버 실행
echo 🔹 Next.js 개발 서버 실행...
start "" cmd /k "cd %~dp0 && npm run dev"

echo ✅ 모든 서버 실행 완료
pause