#!/bin/bash
# 날아라 아유 보드 — 더블클릭하면 바뀐 파일을 깃헙에 커밋하고 푸시한다.
# 로그인은 이 맥에 저장된 깃헙 정보(키체인)를 그대로 쓴다.
cd "$(dirname "$0")" || exit 1
echo "▶ 날아라 아유 보드 — 깃헙에 올리는 중…"
git add -A
if ! git diff --cached --quiet; then
  git commit -m "업데이트 $(date '+%Y-%m-%d %H:%M')"
fi
if git push origin main; then
  echo ""
  echo "✅ 올리기 완료! 1~2분 뒤 앱을 두 번 열면 새 버전이 적용돼요."
else
  echo ""
  echo "⚠️ 올리지 못했어요. 위의 메시지를 확인해 주세요."
fi
echo ""
read -n 1 -s -r -p "아무 키나 누르면 창이 닫혀요."
