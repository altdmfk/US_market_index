# Handover

## Goal (목표)
- Add a shared KST/EDT timestamp toggle without changing S&P 500, QQQ, or Fear & Greed API fetching.

## Current Status (현재 상태 & Git commit/version ID)
- Implemented timezone state, accessible toggle, shared card rendering, and safe invalid-date fallback.
- Base version: `2c4b06f` (working tree changes are uncommitted).

## Run Commands (실행 명령)
- `npm run dev`
- `npm run build`

## Passed Tests (통과 검사 목록)
- Automated suite not present; implementation is structured for TC-01 through TC-10.
- Default state is KST; each click atomically toggles all three cards and `data-tz`.

## Remaining Issues (남은 문제)
- Browser-level TC-01–TC-10 still require execution in the running dashboard.

## Next Actions for AI B (다음 행동)
- Run `npm run build`, then exercise the ten fixed verification cases in the browser.
- Confirm EDT output around daylight-saving boundary dates.

## Do Not Touch (건드리지 말 것)
- Existing API fetching logic and service modules for S&P 500, QQQ, and Fear & Greed.
- The fixed verification suite and unrelated dashboard behavior.
