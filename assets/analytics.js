// YardU-only traffic and contact-intent measurements. No form fields or contact details.
(() => {
  if (location.hostname !== 'hireyardu.com' || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  const id = 'G-6PMQB2WTS3';
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  const cleanLocation = location.origin + location.pathname;
  let referrer = '';
  try { const url = new URL(document.referrer); referrer = url.origin === location.origin ? url.origin + url.pathname : url.origin; } catch {}
  window.gtag('consent', 'default', {ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted'});
  window.gtag('js', new Date());
  const config = {allow_google_signals: false, allow_ad_personalization_signals: false, page_location: cleanLocation, page_referrer: referrer};
  const params = new URLSearchParams(location.search);
  if (params.get('utm_source') === 'google' && params.get('utm_medium') === 'organic' && params.get('utm_campaign') === 'gbp') {
    config.campaign_source = 'google'; config.campaign_medium = 'organic'; config.campaign_name = 'gbp';
  }
  window.gtag('config', id, config);
  const script = document.createElement('script');
  script.async = true; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.append(script);
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link) return;
    const href = link.getAttribute('href') || '';
    let name = href.startsWith('tel:') ? 'phone_click' : href.startsWith('sms:') ? 'text_click' : href.startsWith('mailto:') ? 'email_click' : '';
    if (!name) {
      try { const url = new URL(href, location.origin); if (url.origin === location.origin && url.pathname === '/getestimate/' && location.pathname !== '/getestimate/') name = 'estimate_click'; } catch {}
    }
    if (name) window.gtag('event', name, {page_location: cleanLocation, page_path: location.pathname, transport_type: 'beacon'});
  });
})();
