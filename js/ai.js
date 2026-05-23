// ai.js — AI reasoning slot for strategic briefs

(function () {
  'use strict';

  const DEFAULT_ENDPOINT = 'https://token-plan-sgp.xiaomimimo.com';

  function getSettings() {
    return {
      key: localStorage.getItem('atlas:mimoKey') || '',
      endpoint: localStorage.getItem('atlas:mimoEndpoint') || DEFAULT_ENDPOINT,
      enabled: localStorage.getItem('atlas:mimoEnabled') === 'true',
    };
  }

  function saveSettings(settings) {
    localStorage.setItem('atlas:mimoKey', settings.key || '');
    localStorage.setItem('atlas:mimoEndpoint', settings.endpoint || DEFAULT_ENDPOINT);
    localStorage.setItem('atlas:mimoEnabled', settings.enabled ? 'true' : 'false');
  }

  async function generateBrief(event) {
    const settings = getSettings();
    if (!settings.enabled || !settings.key) {
      return heuristicBrief(event);
    }

    const cached = AtlasUtil.cacheGet(`brief:${event.id}`);
    if (cached) return cached;

    const prompt = buildPrompt(event);
    try {
      const res = await fetch(`${settings.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.key}`,
        },
        body: JSON.stringify({
          model: 'ai-v2.5-pro',
          messages: [
            { role: 'system', content: 'You are a geopolitical analyst. Produce concise structured strategic briefs.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 600,
        }),
      });
      if (!res.ok) throw new Error('ai failed: ' + res.status);
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || '';
      const brief = parseBrief(text);
      AtlasUtil.cacheSet(`brief:${event.id}`, brief, 7 * 24 * 60 * 60 * 1000);
      return brief;
    } catch (e) {
      console.warn('[ai] brief failed, falling back:', e);
      return heuristicBrief(event);
    }
  }

  function buildPrompt(event) {
    return `Event: ${event.title}
Date: ${event.date}
Region: ${AtlasUtil.regionName(event.region)}
Country: ${AtlasUtil.countryName(event.country_code)}
Type: ${event.type}
Severity: ${event.severity}/5
Summary: ${event.summary}

Produce a strategic brief with three sections, each 1-2 short paragraphs:

ACTORS: who is involved and what each side wants.
CONSEQUENCES: likely second-order effects within 6-12 months.
ANALOGS: one or two historical parallels with brief explanation.

Use plain prose. Be specific, avoid generic statements. Avoid filler phrases.`;
  }

  function parseBrief(text) {
    const sections = { actors: '', consequences: '', analogs: '' };
    const lines = text.split('\n');
    let current = null;
    for (const line of lines) {
      const t = line.trim();
      if (/^ACTORS:?/i.test(t)) { current = 'actors'; continue; }
      if (/^CONSEQUENCES:?/i.test(t)) { current = 'consequences'; continue; }
      if (/^ANALOGS:?/i.test(t)) { current = 'analogs'; continue; }
      if (current && t) sections[current] += t + ' ';
    }
    return sections.actors || sections.consequences || sections.analogs
      ? sections
      : { full: text };
  }

  function heuristicBrief(event) {
    const country = AtlasUtil.countryName(event.country_code);
    const region = AtlasUtil.regionName(event.region);

    const actorsByType = {
      conflict: `Direct parties operating in ${region}, with adjacent state interests indirectly engaged. Resource flows and security alliances become reference points.`,
      election: `Domestic factions in ${country} contest direction; regional partners watch for foreign policy alignment shifts.`,
      treaty: `Signatory states formalize cooperation; non-signatories reassess their own multilateral positions.`,
      crisis: `Affected populations bear immediate cost; institutional responders test capacity; political actors face accountability pressure.`,
      breakthrough: `Originating actor shifts the local equilibrium; observers in similar positions reassess feasibility of analogous moves.`,
    };

    const consequencesByType = {
      conflict: `Refugee flows, energy and food market dislocations, alliance recalibration. Defense procurement budgets respond on 6-18 month horizons.`,
      election: `Foreign policy adjustments visible within first quarter; treaty obligations honored at minimum threshold.`,
      treaty: `Implementation gaps emerge as parties parse text. Ratification timelines vary; non-compliance disputes within first cycle.`,
      crisis: `Economic spillover into adjacent sectors. Political fallout proportional to perceived governance failure.`,
      breakthrough: `Sets precedent; diffusion to comparable contexts within 12-24 months if costs stayed manageable.`,
    };

    const analogsByType = {
      conflict: `Comparable conflicts exhibit recurring patterns: initial misjudgment of opposing capacity, prolonged stalemate, eventual negotiated reset on shifted ground.`,
      election: `Recent transitions in comparable systems show inertia in foreign policy regardless of campaign rhetoric.`,
      treaty: `Historical agreements of similar architecture show implementation following political will rather than text precision.`,
      crisis: `Past events of comparable scale shifted public-private boundaries in the response domain.`,
      breakthrough: `Earlier analogs show diffusion paths and friction points worth tracking.`,
    };

    return {
      actors: actorsByType[event.type] || 'Multiple state and non-state actors with overlapping interests.',
      consequences: consequencesByType[event.type] || 'Effects propagate through trade, security, and political channels with variable lag.',
      analogs: analogsByType[event.type] || 'Past events of similar character offer pattern reference for forecasting.',
    };
  }

  window.AtlasAI = { getSettings, saveSettings, generateBrief };
})();
