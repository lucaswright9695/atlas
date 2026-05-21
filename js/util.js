// util.js — formatters, event bus, localStorage cache helpers

(function () {
  'use strict';

  const REGION_NAMES = {
    europe: 'Europe',
    asia: 'Asia',
    middle_east: 'Middle East',
    americas: 'Americas',
    africa: 'Africa',
    oceania: 'Oceania',
  };

  const COUNTRY_NAMES = {
    UA: 'Ukraine', RU: 'Russia', US: 'United States', CN: 'China',
    KR: 'South Korea', KP: 'North Korea', JP: 'Japan', IN: 'India',
    PK: 'Pakistan', IR: 'Iran', IL: 'Israel', PS: 'Palestine',
    SA: 'Saudi Arabia', EG: 'Egypt', TR: 'Turkey', SY: 'Syria',
    AF: 'Afghanistan', YE: 'Yemen', LB: 'Lebanon', IQ: 'Iraq',
    GB: 'United Kingdom', DE: 'Germany', FR: 'France', IT: 'Italy',
    ES: 'Spain', PL: 'Poland', NL: 'Netherlands', SE: 'Sweden',
    BR: 'Brazil', AR: 'Argentina', MX: 'Mexico', VE: 'Venezuela',
    NG: 'Nigeria', KE: 'Kenya', ET: 'Ethiopia', SD: 'Sudan',
    ZA: 'South Africa', AU: 'Australia', CA: 'Canada',
    EU: 'European Union', NATO: 'NATO',
  };

  function formatYear(d) {
    return new Date(d).getFullYear();
  }

  function formatDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function regionName(code) { return REGION_NAMES[code] || code; }
  function countryName(code) { return COUNTRY_NAMES[code] || code; }

  function severityLabel(s) {
    if (s >= 5) return 'critical';
    if (s >= 4) return 'high';
    if (s >= 3) return 'moderate';
    if (s >= 2) return 'low';
    return 'minimal';
  }

  // Event bus (lightweight pub-sub)
  const listeners = {};
  function on(event, handler) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(handler);
  }
  function emit(event, payload) {
    (listeners[event] || []).forEach(fn => {
      try { fn(payload); } catch (e) { console.error('[bus]', event, e); }
    });
  }

  // localStorage with TTL
  function cacheGet(key) {
    try {
      const raw = localStorage.getItem('atlas:' + key);
      if (!raw) return null;
      const { value, expires } = JSON.parse(raw);
      if (expires && expires < Date.now()) {
        localStorage.removeItem('atlas:' + key);
        return null;
      }
      return value;
    } catch (e) { return null; }
  }

  function cacheSet(key, value, ttlMs) {
    try {
      const expires = ttlMs ? Date.now() + ttlMs : null;
      localStorage.setItem('atlas:' + key, JSON.stringify({ value, expires }));
    } catch (e) {}
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  window.AtlasUtil = {
    formatYear, formatDate, regionName, countryName, severityLabel,
    on, emit, cacheGet, cacheSet, debounce, escapeHtml,
    REGION_NAMES, COUNTRY_NAMES,
  };
})();
