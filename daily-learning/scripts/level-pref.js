(function () {
  var KEY = 'riri-level';
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="/english/junior/"], a[href*="/english/senior/"]');
    if (!a) return;
    if (a.href.indexOf('/english/junior/') !== -1) localStorage.setItem(KEY, 'junior');
    if (a.href.indexOf('/english/senior/') !== -1) localStorage.setItem(KEY, 'senior');
  });
})();
