// ===== Pemeriksaan tabrakan =====
const Collision = (() => {
  function isWall(pos, cols, rows) {
    return pos.x < 0 || pos.y < 0 || pos.x >= cols || pos.y >= rows;
  }
  function isSelf(body, pos, willGrow) {
    // Jika tidak tumbuh, ekor akan bergerak → abaikan sel ekor terakhir
    const limit = willGrow ? body.length : body.length - 1;
    for (let i = 0; i < limit; i++) {
      if (body[i].x === pos.x && body[i].y === pos.y) return true;
    }
    return false;
  }
  function sameCell(a, b) {
    return !!(a && b && a.x === b.x && a.y === b.y);
  }
  function cellIn(pos, list) {
    return !!(list && list.some(o => o.x === pos.x && o.y === pos.y));
  }

  return { isWall, isSelf, sameCell, cellIn };
})();