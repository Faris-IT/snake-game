(function (M) {
  M.collision = {
    // next = sel tujuan kepala; grow = apakah ular tumbuh pada langkah ini.
    // Mengembalikan 'wall' | 'obstacle' | 'self' | null.
    check: function (s, next, grow) {
      if (next.x < 0 || next.y < 0 || next.x >= s.cols || next.y >= s.rows) return 'wall';
      if (s.obstacles.has(next.x + ',' + next.y)) return 'obstacle';
      // Jika tidak tumbuh, ekor pindah pada langkah yang sama, jadi sel ekor boleh dimasuki.
      var limit = grow ? s.snake.length : s.snake.length - 1;
      for (var i = 0; i < limit; i++) {
        if (s.snake[i].x === next.x && s.snake[i].y === next.y) return 'self';
      }
      return null;
    }
  };
})(window.Mufa = window.Mufa || {});
