/* Ananta Vastram — series page (templates/metaobject/collection_meta.json)
   1. Tabs: links carrying data-av-tab="story" | "looks" switch the panels in place. Every section of the page is
      marked data-av-panel="story" or "looks"; the other panel's sections are hidden. The hash (#story, #looks) keeps
      the choice, so an Instagram link to …#looks opens on the looks. Without this script both panels show in order.
   2. Looks: buttons carrying data-av-look-open="<dialog id>" open that <dialog> as a modal panel. It closes on its
      own button (form method="dialog"), on Escape (native), and on a click on the dimmed page around it. */
(() => {
  if (window.avSeries) return;
  window.avSeries = true;

  const ready = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());

  ready(() => {
    const root = document.querySelector('[data-av-series]');

    /* ---- tabs ------------------------------------------------------------ */
    if (root) {
      const tabs = Array.from(document.querySelectorAll('.av-series-tabs [data-av-tab]'));
      const sections = Array.from(document.querySelectorAll('[data-av-panel]'));
      const hasLooks = sections.some((el) => el.dataset.avPanel === 'looks');

      const show = (name, scroll) => {
        if (name === 'looks' && !hasLooks) name = 'story';
        sections.forEach((el) => {
          // a panel part inside the header section (the opening photograph) hides on its own, so the tabs stay
          const wrap = root.contains(el) ? el : el.closest('.shopify-section') || el;
          wrap.hidden = el.dataset.avPanel !== name;
        });
        tabs.forEach((t) => {
          const on = t.dataset.avTab === name;
          t.classList.toggle('is-active', on);
          if (on) t.setAttribute('aria-current', 'page');
          else t.removeAttribute('aria-current');
        });
        if (scroll) {
          const nav = root.querySelector('.av-series-tabs');
          const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--av-header-h')) || 0;
          const top = nav.getBoundingClientRect().top + window.scrollY - header - 8;
          if (window.scrollY > top) window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
      };

      document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-av-tab]');
        if (!link) return;
        e.preventDefault();
        const name = link.dataset.avTab;
        history.replaceState(null, '', name === 'story' ? location.pathname + location.search : '#' + name);
        show(name, true);
      });

      show(location.hash === '#looks' ? 'looks' : 'story', false);
      window.addEventListener('hashchange', () => show(location.hash === '#looks' ? 'looks' : 'story', true));
    }

    /* ---- look panels ----------------------------------------------------- */
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-av-look-open]');
      if (!opener) return;
      const dialog = document.getElementById(opener.dataset.avLookOpen);
      if (!dialog || typeof dialog.showModal !== 'function') return;
      dialog.showModal();
      document.documentElement.classList.add('av-look-open');
    });

    document.querySelectorAll('dialog.av-look-dialog').forEach((dialog) => {
      // the panel's content fills the dialog box, so a click whose target is the dialog itself landed on the backdrop
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });
      dialog.addEventListener('close', () => document.documentElement.classList.remove('av-look-open'));
    });
  });
})();
