/* English III · typed responses
   Each <textarea class="rsp-field"> sits inside an .rj-badge task box; widget textareas are collected too. Typing is kept in this browser
   (localStorage, per page); the .rsp-save card at the end of the lesson downloads every task and answer as a PDF. */
(function () {
  var fields = [].slice.call(document.querySelectorAll('.rsp-field, .optima-widget textarea'));
  if (!fields.length) return;

  var css = document.createElement('style');
  css.textContent =
    '.rsp-field{display:block;width:100%;box-sizing:border-box;min-height:110px;margin-top:12px;padding:10px 12px;border:1.5px solid #C7CFE6;border-radius:8px;background:#fff;font-family:inherit;font-size:16px;line-height:1.55;color:#1a2340;resize:vertical;}' +
    '.rsp-field:focus{outline:none;border-color:#3B4E8C;box-shadow:0 0 0 3px rgba(59,78,140,0.15);}' +
    '.rsp-save .rsp-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;}' +
    '.rsp-save label{font-size:15px;color:#1a2340;}' +
    '.rsp-name{margin-left:8px;padding:8px 10px;border:1.5px solid #C7CFE6;border-radius:6px;font-family:inherit;font-size:15px;color:#1a2340;min-width:220px;}' +
    '.rsp-pdf{background:#0E1C42;color:#fff;border:0;border-radius:6px;padding:10px 18px;font-family:inherit;font-size:15px;cursor:pointer;}' +
    '.rsp-pdf:hover{background:#3B4E8C;}' +
    '.rsp-note{font-size:14px;color:#3B4E8C;margin-top:10px;min-height:1em;}';
  document.head.appendChild(css);

  var KEY = 'ela11-responses:' + location.pathname.replace(/^.*\//, '');
  var NAME_KEY = 'ela11-responses:name';
  function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var saved = load(KEY) || {};
  fields.forEach(function (f, i) {
    f.id = f.id || 'rsp-' + (i + 1);
    if (saved[f.id]) f.value = saved[f.id];
    f.addEventListener('input', function () { saved[f.id] = f.value; store(KEY, saved); });
  });

  var nameBox = document.querySelector('.rsp-name');
  if (nameBox) {
    nameBox.value = load(NAME_KEY) || '';
    nameBox.addEventListener('input', function () { store(NAME_KEY, nameBox.value); });
  }

  function plain(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  /* the PDF's built-in font covers Latin-1 only: map typographic punctuation to plain equivalents */
  function latin(t) {
    return t.replace(/[‘’′]/g, "'").replace(/[“”″]/g, '"').replace(/–/g, '-')
      .replace(/—/g, ' - ').replace(/…/g, '...').replace(/[^\u0000-ÿ]/g, '');
  }

  var btn = document.querySelector('.rsp-pdf'), note = document.querySelector('.rsp-note');
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (!window.jspdf) { note.textContent = 'The PDF tool did not load. Check your connection and reload the page.'; return; }
    var name = nameBox && nameBox.value.trim() ? nameBox.value.trim() : '';
    var lesson = document.title.replace(/^.*?(—|-)\s*/, '');
    var navy = document.querySelectorAll('div[style*="border-top: 3px solid #55C8E8"]');
    var foot = navy.length ? navy[navy.length - 1].children : [];
    var heading = foot.length > 1 ? plain(foot[1]) : lesson;
    var doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' }), W = 612, H = 792, M = 54, y = M;
    doc.setProperties({ title: latin(heading + (name ? ' · ' + name : '')), subject: 'English III', creator: 'Optima Academy Online' });
    function need(h) { if (y + h > H - M) { doc.addPage(); y = M; } }
    function txt(s, size, style, color, indent) {
      doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size);
      var c = color || [14, 28, 66]; doc.setTextColor(c[0], c[1], c[2]);
      doc.splitTextToSize(latin(s), W - 2 * M - (indent || 0)).forEach(function (l) { need(size * 1.4); doc.text(l, M + (indent || 0), y); y += size * 1.4; });
    }
    txt('ENGLISH III', 8.5, 'bold', [59, 78, 140]); y += 6;
    txt(heading, 17, 'bold'); y += 2;
    txt((name ? name + '   ·   ' : '') + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 11, 'normal', [59, 78, 140]);
    y += 4; doc.setDrawColor(14, 28, 66); doc.setLineWidth(1); doc.line(M, y, W - M, y); y += 20;
    var blank = 0;
    fields.forEach(function (f, i) {
      var box = f.closest('.rj-badge') || f.closest('.optima-widget');
      var label = plain(box && box.querySelector('.rj-label, .widget-kicker'));
      var task = plain(box && box.querySelector('.rj-task, .widget-question'));
      var ans = f.value.trim();
      if (!ans) blank++;
      need(40);
      txt((i + 1) + '. ' + label, 9, 'bold', [199, 146, 44]); y += 1;
      txt(task, 10, 'bold'); y += 3;
      txt(ans || '(not answered)', 10.5, 'normal', ans ? null : [176, 58, 46], 12); y += 14;
    });
    need(20); txt('Optima Academy Online · English III', 8, 'normal', [107, 102, 86]);
    var file = location.pathname.replace(/^.*\//, '').replace(/\.html?$/i, '') || 'lesson';
    doc.save(file + '_responses' + (name ? '_' + name.replace(/[^A-Za-z0-9]+/g, '_') : '') + '.pdf');
    note.textContent = blank ? 'Saved. ' + blank + ' response' + (blank > 1 ? 's are' : ' is') + ' still blank in the PDF.' : 'Saved to your downloads.';
  });
})();
