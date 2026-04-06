# Bugs & Issues Log

## Current Status: No Critical Bugs Found (2025-06-26)

### Test Results
- **pusher.test.js**: 67 tests ✅ all passing
- **minigames.test.js**: 46 tests ✅ all passing
- **integration.test.js**: Browser-based (not automated), ~30 tests defined

---

## Potential Issues (Low Priority)

### 1. Missing Item Count Cap
**Location**: `js/games/pusher.js` - `PusherGame.update()`
**Severity**: Low
**Issue**: No maximum item limit enforced during gameplay. With very high auto-drop rates and long sessions, item count could theoretically grow unbounded.
**Recommendation**: Add soft cap around 500 items, or implement garbage collection for oldest settled items.

### 2. Browser Test Automation Gap
**Location**: `tests/runner.html`
**Severity**: Low  
**Issue**: integration.test.js requires manual browser execution - not part of CI/CD.
**Recommendation**: Consider Playwright or Puppeteer for automated browser testing.

---

## Resolved Issues

### O(n²) Collision Performance ✅
**Fixed in**: `js/games/pusher.js` lines 390-396
**Solution**: Changed from checking all pairs twice to `j = i + 1` pattern, halving comparisons.
**Verified**: 200 items × 60 frames completes successfully in test suite.

---

## Testing Notes

### Coverage Summary
- ✅ Physics (gravity, velocity, bouncing, settling)
- ✅ Prize rolling (weights, distribution)
- ✅ Upgrade system (costs, values, progression)
- ✅ Combo multipliers
- ✅ State persistence (localStorage)
- ✅ Edge cases (boundaries, zero velocity, negative karma)
- ⚠️ Event→Outcome→Tag flow (needs integration tests)
- ⚠️ Multi-game karma transfer (needs integration tests)
