// render.js — render sidebar country list, detail panel for selected event

(function () {
  'use strict';

  function renderCountryList(events) {
    const counts = {};
    events.forEach(e => {
      counts[e.country_code] = (counts[e.country_code] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const ul = document.getElementById('country-list');
    ul.innerHTML = '';
    sorted.forEach(([code, count]) => {
      const li = document.createElement('li');
      li.dataset.code = code;
      li.innerHTML = `<span>${AtlasUtil.escapeHtml(AtlasUtil.countryName(code))}</span><span class="count">${count}</span>`;
      ul.appendChild(li);
    });
  }

  async function renderDetail(event) {
    const el = document.getElementById('detail');
    el.innerHTML = `
      <div class="detail__head">
        <span class="detail__type" style="color:${typeColor(event.type)}">${AtlasUtil.escapeHtml(event.type)}</span>
        <h2 class="detail__title">${AtlasUtil.escapeHtml(event.title)}</h2>
        <div class="detail__meta">
          ${AtlasUtil.formatDate(event.date)} · ${AtlasUtil.escapeHtml(AtlasUtil.countryName(event.country_code))} · severity ${event.severity}/5 (${AtlasUtil.severityLabel(event.severity)})
        </div>
      </div>
      <div class="detail__summary">${AtlasUtil.escapeHtml(event.summary)}</div>
      <div class="detail__brief-title">Strategic brief</div>
      <div class="detail__brief-body" id="brief-body">
        <div class="detail__loading">Generating brief</div>
      </div>
    `;

    const brief = await AtlasAI.generateBrief(event);
    const body = document.getElementById('brief-body');
    if (!body) return;

    if (brief.full) {
      body.innerHTML = `<p>${AtlasUtil.escapeHtml(brief.full).replace(/\n/g, '</p><p>')}</p>`;
    } else {
      body.innerHTML = `
        <p><strong>Actors.</strong> ${AtlasUtil.escapeHtml(brief.actors || '')}</p>
        <p><strong>Consequences.</strong> ${AtlasUtil.escapeHtml(brief.consequences || '')}</p>
        <p><strong>Historical analogs.</strong> ${AtlasUtil.escapeHtml(brief.analogs || '')}</p>
      `;
    }
  }

  function renderEmpty() {
    const el = document.getElementById('detail');
    el.innerHTML = `
      <div class="detail__empty">
        <div class="detail__empty-icon">·</div>
        <div class="detail__empty-text">Select an event on the timeline to see its strategic brief.</div>
      </div>
    `;
  }

  function typeColor(t) {
    return ({
      conflict: '#E14B4B', election: '#F3CF5E', treaty: '#7AC74F',
      crisis: '#FF8C42', breakthrough: '#5DADE2',
    })[t] || '#888';
  }

  window.AtlasRender = { renderCountryList, renderDetail, renderEmpty };
})();
