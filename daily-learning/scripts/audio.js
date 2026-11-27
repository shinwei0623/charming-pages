(function () {
  let current = null;

  function fallbackSpeak(word) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = 'en-US';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

  function playButton(btn) {
    const word = btn.getAttribute('data-word') || '';
    const src = btn.getAttribute('data-src') || '';
    if (current && !current.paused) {
      current.pause();
      current.currentTime = 0;
    }
    if (src) {
      const audio = new Audio(src);
      current = audio;
      audio.play().catch(function () {
        fallbackSpeak(word);
      });
    } else {
      fallbackSpeak(word);
    }
  }

  document.addEventListener('click', function (event) {
    const btn = event.target.closest && event.target.closest('.audio-btn');
    if (btn) {
      playButton(btn);
      return;
    }
    const mark = event.target.closest && event.target.closest('.story strong');
    if (mark) {
      const word = (mark.textContent || '').trim();
      const id = 'word-' + word.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const card = document.getElementById(id);
      if (card) {
        card.classList.add('is-active');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const audioBtn = card.querySelector('.audio-btn');
        if (audioBtn) playButton(audioBtn);
        setTimeout(function () { card.classList.remove('is-active'); }, 2200);
      }
    }
  });
})();
