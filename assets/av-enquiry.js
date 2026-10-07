/* Enquiry form: validate on leaving a field and on Send (never on the first keystroke), then let the form post natively.
   Shopify's spam protection attaches an hCaptcha token to native contact-form submits (a fetch post is refused with
   "Missing CAPTCHA token"), so the sent state is the server-rendered one at ?contact_posted=true; on that load the
   script moves focus to the sent heading. The busy state covers the moment between Send and the redirect. */
(function () {
  if (customElements.get('av-enquiry-form')) return;

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function localDate(value) { // 'YYYY-MM-DD' as local midnight, or null
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function isoDate(d) {
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  class AvEnquiryForm extends HTMLElement {
    connectedCallback() {
      var form = this.form = this.querySelector('form.av-form');
      this.sent = this.querySelector('.av-sent');
      if (!form) return;
      if (form.classList.contains('is-sent')) { // server-rendered sent state after Shopify's redirect
        var heading = this.sent && this.sent.querySelector('h2');
        if (heading) { heading.focus({ preventScroll: true }); this.sent.scrollIntoView({ block: 'center' }); }
        return;
      }
      this.email = form.elements['contact[email]'];
      this.date = form.elements['contact[date]'];
      this.occasion = form.querySelector('input[name="contact[occasion]"]');
      if (!form.elements['contact[name]'] || !this.email || !this.date || !this.occasion) return;
      this.button = form.querySelector('button[type="submit"]');
      this.formError = form.querySelector('.av-form__error');
      this.hint = form.querySelector('.av-field__hint');
      this.leadWeeks = parseInt(form.dataset.leadWeeks, 10) || 0;
      this.sending = false;

      var section = this.closest('.av-enquiry') || this;
      this.wa = section.querySelectorAll('.av-enquiry__wa');
      this.waText = 'A commission enquiry';
      if (this.wa.length) {
        try { this.waText = new URL(this.wa[0].href).searchParams.get('text') || this.waText; } catch (e) { /* keep the default */ }
      }

      form.noValidate = true; // our messages instead of the browser's bubbles; without JS the native checks still run
      this.date.min = isoDate(new Date()); // today on the visitor's clock, in case the page was cached
      form.addEventListener('focusout', this.onBlur.bind(this));
      form.addEventListener('input', this.onInput.bind(this));
      form.addEventListener('change', this.onInput.bind(this));
      form.addEventListener('submit', this.onSubmit.bind(this));
    }

    isControl(el) {
      return el && el.closest && el.closest('.av-field') && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    }

    onBlur(e) {
      var c = e.target;
      if (!this.isControl(c)) return;
      if (c.type === 'radio' && e.relatedTarget && e.relatedTarget.name === c.name) return; // arrowing within the group
      this.validate(c, true);
    }

    onInput(e) {
      var c = e.target;
      if (!this.isControl(c)) return;
      if (c === this.date) this.warnLead();
      if (c === this.date || c.name === this.occasion.name) this.updateWhatsApp();
      this.validate(c, false); // only clears an error already shown
    }

    // Returns true when the control is valid. `show` writes the invalid state; otherwise only an existing error is updated.
    validate(control, show) {
      var field = control.closest('.av-field');
      var error = field && field.querySelector('.av-field__error');
      if (!error) return true; // optional field
      var value = control.value.trim();
      var valid;
      if (control.type === 'radio') {
        valid = !!this.form.querySelector('input[name="' + control.name + '"]:checked');
      } else if (control.type === 'email') {
        valid = EMAIL.test(value);
      } else if (control.type === 'date') {
        var past = !!value && control.validity.rangeUnderflow;
        valid = !!value && !past;
        if (error.dataset.past) error.textContent = past ? error.dataset.past : error.dataset.missing;
      } else {
        valid = value !== '';
      }
      if (show || field.classList.contains('is-invalid')) {
        field.classList.toggle('is-invalid', !valid);
        var controls = control.type === 'radio' ? this.form.querySelectorAll('input[name="' + control.name + '"]') : [control];
        Array.prototype.forEach.call(controls, function (c) {
          if (valid) { c.removeAttribute('aria-invalid'); c.removeAttribute('aria-describedby'); }
          else { c.setAttribute('aria-invalid', 'true'); c.setAttribute('aria-describedby', error.id); }
        });
      }
      return valid;
    }

    warnLead() {
      if (!this.hint) return;
      var chosen = localDate(this.date.value);
      var text = '';
      if (chosen && this.leadWeeks > 0) {
        var limit = new Date();
        limit.setHours(0, 0, 0, 0);
        limit.setDate(limit.getDate() + this.leadWeeks * 7);
        if (chosen < limit) text = this.hint.dataset.text || '';
      }
      if (this.hint.textContent !== text) this.hint.textContent = text;
    }

    updateWhatsApp() {
      if (!this.wa.length) return;
      var occasion = this.form.querySelector('input[name="' + this.occasion.name + '"]:checked');
      var chosen = localDate(this.date.value);
      var text = this.waText;
      if (occasion) text += ' — ' + occasion.value.toLowerCase();
      if (chosen) text += (occasion ? ', ' : ' — ') + chosen.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      var encoded = encodeURIComponent(text);
      Array.prototype.forEach.call(this.wa, function (a) { a.href = a.href.split('?')[0] + '?text=' + encoded; });
    }

    onSubmit(e) {
      if (this.sending) { e.preventDefault(); return; }
      var self = this;
      var first = null;
      var required = [this.form.elements['contact[name]'], this.email, this.occasion, this.date];
      required.forEach(function (c) { if (!self.validate(c, true) && !first) first = c; });
      if (first) { e.preventDefault(); first.focus(); return; }
      this.setError('');
      this.busy(true);
      // no preventDefault: the native submit carries Shopify's captcha token and redirects to ?contact_posted=true
    }

    busy(on) {
      this.sending = on;
      this.form.classList.toggle('is-sending', on);
      if (on) this.button.setAttribute('aria-busy', 'true'); else this.button.removeAttribute('aria-busy');
      // fields stay enabled: a disabled field is dropped from the post
    }

    setError(text) {
      if (this.formError) this.formError.textContent = text;
    }
  }

  customElements.define('av-enquiry-form', AvEnquiryForm);
})();
