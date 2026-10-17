(function (M) {
  M.random = {
    int: function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    // Pilih sel yang benar-benar kosong. blocked = Set berisi "x,y". Mengembalikan null jika penuh.
    emptyCell: function (cols, rows, blocked) {
      var free = [];
      for (var y = 0; y < rows; y++)
        for (var x = 0; x < cols; x++)
          if (!blocked.has(x + ',' + y)) free.push({ x: x, y: y });
      return free.length ? free[Math.floor(Math.random() * free.length)] : null;
    }
  };
})(window.Mufa = window.Mufa || {});
