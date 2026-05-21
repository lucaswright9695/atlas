// timeline.js — SVG horizontal timeline rendering with year axis, event nodes, click handling

(function () {
  'use strict';

  const TYPE_COLORS = {
    conflict: '#E14B4B',
    election: '#F3CF5E',
    treaty: '#7AC74F',
    crisis: '#FF8C42',
    breakthrough: '#5DADE2',
  };

  const MARGIN = { top: 40, right: 60, bottom: 80, left: 60 };

  let state = {
    events: [],
    filtered: [],
    yearRange: [2020, 2025],
    selectedId: null,
  };

  function init(events) {
    state.events = events;
    applyFilters();
    render();
  }

  function applyFilters() {
    const region = document.querySelector('#region-filters .is-active')?.dataset.region || 'all';
    const type = document.querySelector('#type-filters .is-active')?.dataset.type || 'all';
    const [yMin, yMax] = state.yearRange;

    state.filtered = state.events.filter(e => {
      if (region !== 'all' && e.region !== region) return false;
      if (type !== 'all' && e.type !== type) return false;
      const y = AtlasUtil.formatYear(e.date);
      return y >= yMin && y <= yMax;
    });
  }

  function render() {
    const svg = document.getElementById('timeline');
    const container = document.getElementById('timeline-wrap');
    const containerRect = container.getBoundingClientRect();
    const yearSpan = state.yearRange[1] - state.yearRange[0] + 1;
    const minWidth = Math.max(containerRect.width - 48, yearSpan * 220);

    svg.setAttribute('viewBox', `0 0 ${minWidth} 600`);
    svg.setAttribute('width', minWidth);
    svg.setAttribute('height', 600);

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    drawAxis(svg, minWidth, yearSpan);
    drawEvents(svg, minWidth);
  }

  function xForDate(date, totalWidth) {
    const dt = new Date(date);
    const yearStart = new Date(`${state.yearRange[0]}-01-01`);
    const yearEnd = new Date(`${state.yearRange[1]}-12-31`);
    const totalMs = yearEnd - yearStart;
    const elapsed = dt - yearStart;
    const innerWidth = totalWidth - MARGIN.left - MARGIN.right;
    return MARGIN.left + (elapsed / totalMs) * innerWidth;
  }

  function yForRegion(region) {
    const regions = ['europe', 'asia', 'middle_east', 'americas', 'africa', 'oceania', 'global'];
    const idx = regions.indexOf(region);
    const trackHeight = (600 - MARGIN.top - MARGIN.bottom) / regions.length;
    return MARGIN.top + idx * trackHeight + trackHeight / 2;
  }

  function drawAxis(svg, width, yearSpan) {
    const NS = 'http://www.w3.org/2000/svg';
    const axisGroup = document.createElementNS(NS, 'g');
    axisGroup.setAttribute('class', 'year-axis');

    const baselineY = 600 - MARGIN.bottom + 20;

    const baseline = document.createElementNS(NS, 'line');
    baseline.setAttribute('x1', MARGIN.left);
    baseline.setAttribute('x2', width - MARGIN.right);
    baseline.setAttribute('y1', baselineY);
    baseline.setAttribute('y2', baselineY);
    baseline.setAttribute('class', 'major-tick');
    axisGroup.appendChild(baseline);

    for (let y = state.yearRange[0]; y <= state.yearRange[1]; y++) {
      const x = xForDate(`${y}-01-01`, width);
      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('x1', x);
      tick.setAttribute('x2', x);
      tick.setAttribute('y1', baselineY);
      tick.setAttribute('y2', baselineY + 8);
      tick.setAttribute('class', 'major-tick');
      axisGroup.appendChild(tick);

      const label = document.createElementNS(NS, 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', baselineY + 28);
      label.setAttribute('text-anchor', 'middle');
      label.textContent = y;
      axisGroup.appendChild(label);

      // Quarterly minor ticks
      for (let q = 1; q <= 3; q++) {
        const qx = xForDate(`${y}-${String(q * 3 + 1).padStart(2, '0')}-01`, width);
        const minor = document.createElementNS(NS, 'line');
        minor.setAttribute('x1', qx);
        minor.setAttribute('x2', qx);
        minor.setAttribute('y1', baselineY);
        minor.setAttribute('y2', baselineY + 4);
        minor.setAttribute('class', 'minor-tick');
        axisGroup.appendChild(minor);
      }
    }

    // Region track labels
    const regions = [
      ['europe', 'Europe'], ['asia', 'Asia'], ['middle_east', 'Middle East'],
      ['americas', 'Americas'], ['africa', 'Africa'], ['oceania', 'Oceania'], ['global', 'Global'],
    ];
    regions.forEach(([code, label]) => {
      const y = yForRegion(code);
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', 8);
      text.setAttribute('y', y + 4);
      text.setAttribute('fill', '#6F6F6F');
      text.setAttribute('font-family', 'monospace');
      text.setAttribute('font-size', '10');
      text.textContent = label;
      axisGroup.appendChild(text);

      const trackLine = document.createElementNS(NS, 'line');
      trackLine.setAttribute('x1', MARGIN.left);
      trackLine.setAttribute('x2', width - MARGIN.right);
      trackLine.setAttribute('y1', y);
      trackLine.setAttribute('y2', y);
      trackLine.setAttribute('stroke', '#1F1F1F');
      trackLine.setAttribute('stroke-dasharray', '2 6');
      axisGroup.appendChild(trackLine);
    });

    svg.appendChild(axisGroup);
  }

  function drawEvents(svg, width) {
    const NS = 'http://www.w3.org/2000/svg';
    state.filtered.forEach(event => {
      const x = xForDate(event.date, width);
      const y = yForRegion(event.region);
      const r = 4 + event.severity * 2;

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'event-node-group');

      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', TYPE_COLORS[event.type] || '#888');
      circle.setAttribute('class', 'event-node');
      circle.setAttribute('data-id', event.id);
      if (event.id === state.selectedId) circle.classList.add('is-selected');

      circle.addEventListener('click', () => {
        state.selectedId = event.id;
        document.querySelectorAll('.event-node.is-selected').forEach(n => n.classList.remove('is-selected'));
        circle.classList.add('is-selected');
        AtlasUtil.emit('event:selected', event);
      });

      // Title on hover
      const title = document.createElementNS(NS, 'title');
      title.textContent = `${AtlasUtil.formatDate(event.date)} — ${event.title}`;
      circle.appendChild(title);

      g.appendChild(circle);
      svg.appendChild(g);
    });
  }

  function setYearRange(min, max) {
    state.yearRange = [min, max];
    applyFilters();
    render();
  }

  function refresh() {
    applyFilters();
    render();
  }

  window.AtlasTimeline = { init, refresh, setYearRange };
})();
