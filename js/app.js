// app.js — entry: load events, build timeline, bind interactions

(function () {
  'use strict';

  async function main() {
    const events = await AtlasSources.loadEvents();
    AtlasTimeline.init(events);
    AtlasRender.renderCountryList(events);

    AtlasUtil.on('event:selected', AtlasRender.renderDetail);

    bindFilters();
    bindYearRange();
    bindSettings();

    document.getElementById('btn-refresh').addEventListener('click', async () => {
      localStorage.removeItem('atlas:events');
      const fresh = await AtlasSources.loadEvents();
      AtlasTimeline.init(fresh);
      AtlasRender.renderCountryList(fresh);
      AtlasRender.renderEmpty();
    });

    window.addEventListener('resize', AtlasUtil.debounce(() => AtlasTimeline.refresh(), 200));
  }

  function bindFilters() {
    document.querySelectorAll('#region-filters .filter-pill').forEach(p => {
      p.addEventListener('click', () => {
        document.querySelectorAll('#region-filters .filter-pill').forEach(x => x.classList.remove('is-active'));
        p.classList.add('is-active');
        AtlasTimeline.refresh();
      });
    });
    document.querySelectorAll('#type-filters .filter-pill').forEach(p => {
      p.addEventListener('click', () => {
        document.querySelectorAll('#type-filters .filter-pill').forEach(x => x.classList.remove('is-active'));
        p.classList.add('is-active');
        AtlasTimeline.refresh();
      });
    });
  }

  function bindYearRange() {
    const min = document.getElementById('year-min');
    const max = document.getElementById('year-max');
    const readout = document.getElementById('year-readout');

    function update() {
      let lo = parseInt(min.value);
      let hi = parseInt(max.value);
      if (lo > hi) [lo, hi] = [hi, lo];
      readout.textContent = `${lo} — ${hi}`;
      AtlasTimeline.setYearRange(lo, hi);
    }

    min.addEventListener('input', update);
    max.addEventListener('input', update);
  }

  function bindSettings() {
    const modal = document.getElementById('settings-modal');
    const open = document.getElementById('btn-settings');
    const save = document.getElementById('settings-save');
    const keyEl = document.getElementById('ai-key');
    const endpointEl = document.getElementById('ai-endpoint');
    const enabledEl = document.getElementById('ai-enabled');

    open.addEventListener('click', () => {
      const s = AtlasAI.getSettings();
      keyEl.value = s.key;
      endpointEl.value = s.endpoint;
      enabledEl.checked = s.enabled;
      modal.removeAttribute('hidden');
    });

    modal.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => modal.setAttribute('hidden', ''));
    });

    save.addEventListener('click', () => {
      AtlasAI.saveSettings({
        key: keyEl.value.trim(),
        endpoint: endpointEl.value.trim(),
        enabled: enabledEl.checked,
      });
      modal.setAttribute('hidden', '');
    });
  }

  document.addEventListener('DOMContentLoaded', main);
})();
