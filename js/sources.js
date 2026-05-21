// sources.js — event data: hardcoded historical fallback + live fetcher

(function () {
  'use strict';

  // 32 hardcoded historical events 2020-2025 — fallback when live fetch blocked
  const HARDCODED_EVENTS = [
    { id: 'h1', date: '2020-01-03', region: 'middle_east', country_code: 'IR', title: 'Soleimani strike', summary: 'US drone strike kills Iranian general Qasem Soleimani at Baghdad airport, escalating Iran-US tensions.', type: 'conflict', severity: 4 },
    { id: 'h2', date: '2020-03-11', region: 'asia', country_code: 'CN', title: 'WHO declares COVID-19 pandemic', summary: 'World Health Organization classifies novel coronavirus as a global pandemic, triggering worldwide lockdowns.', type: 'crisis', severity: 5 },
    { id: 'h3', date: '2020-08-04', region: 'middle_east', country_code: 'LB', title: 'Beirut port explosion', summary: 'Ammonium nitrate detonation at Beirut harbor kills over 200, deepening Lebanon political crisis.', type: 'crisis', severity: 4 },
    { id: 'h4', date: '2020-11-03', region: 'americas', country_code: 'US', title: 'US presidential election', summary: 'Joe Biden elected over Donald Trump, contested certification preceded January 6.', type: 'election', severity: 4 },
    { id: 'h5', date: '2020-12-30', region: 'europe', country_code: 'EU', title: 'EU-China investment agreement', summary: 'Comprehensive Agreement on Investment concluded after seven years of negotiation.', type: 'treaty', severity: 3 },
    { id: 'h6', date: '2021-01-06', region: 'americas', country_code: 'US', title: 'US Capitol breach', summary: 'Trump supporters storm Capitol during certification of electoral votes.', type: 'crisis', severity: 4 },
    { id: 'h7', date: '2021-08-15', region: 'middle_east', country_code: 'AF', title: 'Taliban retake Kabul', summary: 'Afghan government collapses as Taliban enter capital following US withdrawal.', type: 'conflict', severity: 5 },
    { id: 'h8', date: '2021-09-15', region: 'asia', country_code: 'AU', title: 'AUKUS announced', summary: 'Trilateral security pact between Australia, UK, US targeting Indo-Pacific posture.', type: 'treaty', severity: 4 },
    { id: 'h9', date: '2021-11-13', region: 'europe', country_code: 'GB', title: 'Glasgow Climate Pact', summary: 'COP26 outcome includes phase-down of unabated coal power, first such mention in COP text.', type: 'treaty', severity: 3 },
    { id: 'h10', date: '2022-02-24', region: 'europe', country_code: 'UA', title: 'Russia invades Ukraine', summary: 'Full-scale invasion launched after months of buildup, triggering largest European refugee crisis since WWII.', type: 'conflict', severity: 5 },
    { id: 'h11', date: '2022-05-15', region: 'europe', country_code: 'SE', title: 'Finland and Sweden seek NATO membership', summary: 'Both nations abandon non-alignment in response to Russian aggression.', type: 'treaty', severity: 4 },
    { id: 'h12', date: '2022-09-08', region: 'europe', country_code: 'GB', title: 'Queen Elizabeth II dies', summary: '70-year reign ends, Charles III ascends; transition tests Commonwealth structure.', type: 'breakthrough', severity: 3 },
    { id: 'h13', date: '2022-09-26', region: 'europe', country_code: 'RU', title: 'Nord Stream sabotage', summary: 'Underwater pipelines linking Russia to Germany suffer multiple ruptures; investigation continues.', type: 'crisis', severity: 4 },
    { id: 'h14', date: '2022-11-20', region: 'middle_east', country_code: 'SA', title: 'World Cup in Qatar', summary: 'First Arab nation to host FIFA World Cup amid scrutiny over labor and rights.', type: 'breakthrough', severity: 2 },
    { id: 'h15', date: '2023-02-06', region: 'middle_east', country_code: 'TR', title: 'Türkiye-Syria earthquakes', summary: 'M7.8 and M7.5 quakes kill over 50,000, exposing infrastructure vulnerabilities.', type: 'crisis', severity: 5 },
    { id: 'h16', date: '2023-03-10', region: 'middle_east', country_code: 'IR', title: 'Iran-Saudi Arabia rapprochement', summary: 'China-brokered restoration of diplomatic relations between long-time regional rivals.', type: 'treaty', severity: 4 },
    { id: 'h17', date: '2023-04-15', region: 'africa', country_code: 'SD', title: 'Sudan civil war erupts', summary: 'Conflict between SAF and RSF breaks out across Khartoum, displacing millions.', type: 'conflict', severity: 5 },
    { id: 'h18', date: '2023-06-23', region: 'europe', country_code: 'RU', title: 'Wagner mutiny', summary: 'Wagner Group march toward Moscow halted via Belarus deal; Prigozhin killed in plane crash two months later.', type: 'crisis', severity: 4 },
    { id: 'h19', date: '2023-10-07', region: 'middle_east', country_code: 'IL', title: 'Hamas attack on Israel', summary: 'Cross-border attack from Gaza kills 1,200+; triggers Israeli military operation in Gaza.', type: 'conflict', severity: 5 },
    { id: 'h20', date: '2023-11-30', region: 'asia', country_code: 'CN', title: 'Henry Kissinger dies', summary: 'Architect of US-China rapprochement passes at 100; legacy debated across foreign policy schools.', type: 'breakthrough', severity: 3 },
    { id: 'h21', date: '2024-01-13', region: 'asia', country_code: 'KR', title: 'Taiwan presidential election', summary: 'Lai Ching-te (DPP) wins, signaling continuity of cross-strait posture amid PRC pressure.', type: 'election', severity: 4 },
    { id: 'h22', date: '2024-04-13', region: 'middle_east', country_code: 'IR', title: 'Iran direct strike on Israel', summary: 'First-ever direct Iranian missile and drone barrage on Israeli territory; most intercepted.', type: 'conflict', severity: 5 },
    { id: 'h23', date: '2024-06-09', region: 'europe', country_code: 'EU', title: 'European Parliament elections', summary: 'Far-right gains in France and Germany; Macron calls snap French election.', type: 'election', severity: 4 },
    { id: 'h24', date: '2024-07-13', region: 'americas', country_code: 'US', title: 'Trump assassination attempt', summary: 'Shooter targets Trump at Pennsylvania rally; one rally-goer killed, Trump grazed.', type: 'crisis', severity: 4 },
    { id: 'h25', date: '2024-09-17', region: 'middle_east', country_code: 'LB', title: 'Pager attacks in Lebanon', summary: 'Coordinated detonation of Hezbollah pagers and walkie-talkies; expanded Israel-Hezbollah conflict.', type: 'conflict', severity: 4 },
    { id: 'h26', date: '2024-11-05', region: 'americas', country_code: 'US', title: 'US presidential election', summary: 'Trump wins second non-consecutive term over Harris, with sweep of swing states.', type: 'election', severity: 5 },
    { id: 'h27', date: '2024-12-08', region: 'middle_east', country_code: 'SY', title: 'Assad regime falls', summary: 'HTS-led offensive captures Damascus; 50-year Assad rule ends, transitional government forms.', type: 'crisis', severity: 5 },
    { id: 'h28', date: '2025-01-15', region: 'middle_east', country_code: 'IL', title: 'Gaza ceasefire phase 1', summary: 'First-stage ceasefire with hostage releases; tenuous through subsequent phases.', type: 'treaty', severity: 4 },
    { id: 'h29', date: '2025-04-08', region: 'asia', country_code: 'KR', title: 'South Korea snap election', summary: 'Following Yoon Suk-yeol martial law attempt and impeachment, opposition takes presidency.', type: 'election', severity: 4 },
    { id: 'h30', date: '2025-09-14', region: 'europe', country_code: 'DE', title: 'Germany defense doctrine shift', summary: 'Bundestag passes constitutional amendment lifting debt brake for defense spending.', type: 'breakthrough', severity: 4 },
    { id: 'h31', date: '2025-11-02', region: 'americas', country_code: 'AR', title: 'Argentina-IMF restructuring', summary: 'Final disbursement under Milei reform program; first sustained fiscal surplus in 14 years.', type: 'breakthrough', severity: 3 },
    { id: 'h32', date: '2025-12-19', region: 'asia', country_code: 'IN', title: 'India hosts G20 summit', summary: 'New Delhi declaration includes African Union accession to G20 as permanent member.', type: 'treaty', severity: 3 },
  ];

  const CORS_PROXIES = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  async function fetchWithProxyChain(url, signal) {
    for (const proxyFn of CORS_PROXIES) {
      try {
        const res = await fetch(proxyFn(url), { signal });
        if (res.ok) return await res.text();
      } catch (e) {}
    }
    throw new Error('all proxies failed');
  }

  // Live source: Wikipedia current events (Atom feed)
  async function fetchWikipediaEvents() {
    const url = 'https://en.wikipedia.org/w/api.php?action=feedrecentchanges&format=atom&namespace=0&days=30&limit=50';
    try {
      const xml = await fetchWithProxyChain(url);
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const entries = [...doc.querySelectorAll('entry')];
      return entries.slice(0, 30).map((entry, i) => {
        const title = entry.querySelector('title')?.textContent || '';
        const summary = entry.querySelector('summary')?.textContent?.replace(/<[^>]+>/g, '').slice(0, 240) || '';
        const updated = entry.querySelector('updated')?.textContent || '';
        return {
          id: 'live_' + i,
          date: updated.slice(0, 10),
          region: 'global',
          country_code: 'WORLD',
          title: title,
          summary: summary,
          type: classifyType(title, summary),
          severity: 2,
          source: 'Wikipedia',
        };
      }).filter(e => e.title && e.date);
    } catch (e) {
      console.warn('[sources] live fetch failed, using fallback');
      return [];
    }
  }

  function classifyType(title, summary) {
    const t = (title + ' ' + summary).toLowerCase();
    if (/war|attack|strike|invasion|killed|conflict/.test(t)) return 'conflict';
    if (/election|vote|polls|ballot|presidency/.test(t)) return 'election';
    if (/treaty|agreement|accord|pact|deal/.test(t)) return 'treaty';
    if (/crisis|emergency|disaster|earthquake|flood/.test(t)) return 'crisis';
    return 'breakthrough';
  }

  async function loadEvents() {
    const cached = AtlasUtil.cacheGet('events');
    if (cached) return cached;

    const live = await fetchWikipediaEvents();
    const all = [...HARDCODED_EVENTS, ...live].sort((a, b) => a.date.localeCompare(b.date));

    AtlasUtil.cacheSet('events', all, 24 * 60 * 60 * 1000);
    return all;
  }

  window.AtlasSources = { loadEvents, HARDCODED_EVENTS };
})();
