/* INR / USD price switch. Prices are stored and charged in rupees; this only changes how they are shown.
   A visitor Shopify places in the USA sees dollars first; anyone can switch in the footer, and the choice is remembered.
   The rate is Theme settings > Ananta Vastram > "Rupees to one US dollar". */
(function () {
  var boxes = document.querySelectorAll('[data-av-currency]');
  if (!boxes.length) return;
  var rate = parseFloat(boxes[0].getAttribute('data-rate'));
  if (!(rate > 0)) return;
  var KEY = 'avCurrency';
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function show(cur) {
    document.querySelectorAll('.av-money[data-av-inr]').forEach(function (el) {
      if (!el.hasAttribute('data-av-inr-text')) el.setAttribute('data-av-inr-text', el.textContent);
      if (cur === 'USD') {
        var usd = Math.round(parseFloat(el.getAttribute('data-av-inr')) / rate);
        el.textContent = 'US\u00a0$' + usd.toLocaleString('en-US');
      } else {
        el.textContent = el.getAttribute('data-av-inr-text');
      }
    });
    document.querySelectorAll('[data-av-cur]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-av-cur') === cur ? 'true' : 'false'); });
    document.querySelectorAll('[data-av-cur-toggle]').forEach(function (b) { b.textContent = cur === 'USD' ? 'USD $' : 'INR \u20b9'; b.setAttribute('aria-label', 'Prices in ' + (cur === 'USD' ? 'US dollars' : 'Indian rupees') + '. Switch to ' + (cur === 'USD' ? 'rupees' : 'dollars')); });
    current = cur;
    document.documentElement.setAttribute('data-av-currency', cur);
  }
  var current = 'INR';
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-av-cur-toggle]');
    if (t) { var nx = current === 'USD' ? 'INR' : 'USD'; save(nx); show(nx); return; }
    var b = e.target.closest('[data-av-cur]');
    if (!b) return;
    var cur = b.getAttribute('data-av-cur');
    save(cur);
    show(cur);
  });
  var choice = saved();
  if (choice === 'USD' || choice === 'INR') { show(choice); return; }
  /* no choice yet: ask Shopify where the visitor is */
  fetch('/browsing_context_suggestions.json?country[enabled]=true', { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      var code = d && d.detected_values && d.detected_values.country && d.detected_values.country.handle;
      if (code === 'US') show('USD');
    })
    .catch(function () {});
})();
