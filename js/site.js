
(() => {
  'use strict';
  const C = window.MUA_CONFIG || {};
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const safe = (v='') => String(v).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));

  // Lightweight analytics abstraction. Never stores personal form contents.
  function track(name, details={}) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:name, ...details});
      if (window.gtag) window.gtag('event', name, details);
    } catch(e) { /* analytics must never break the site */ }
  }
  window.MUA_TRACK = track;

  // GA4 only loads when configured.
  if (C.ga4MeasurementId) {
    const s=document.createElement('script'); s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(C.ga4MeasurementId); document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[]; window.gtag=function(){window.dataLayer.push(arguments)}; window.gtag('js',new Date()); window.gtag('config',C.ga4MeasurementId);
  }
  track('page_view', {page_path: location.pathname});

  // UTM attribution persists for the current session.
  const params = new URLSearchParams(location.search);
  const utm = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const ATTR_KEY='mua_attribution_v1';
  let attribution={}; try{ attribution=JSON.parse(sessionStorage.getItem(ATTR_KEY)||'{}'); }catch(e){}
  utm.forEach(k=>{ if(params.get(k)) attribution[k]=params.get(k); });
  attribution.landing_page ||= location.href;
  attribution.referrer ||= document.referrer || '';
  try{sessionStorage.setItem(ATTR_KEY, JSON.stringify(attribution));}catch(e){}

  // Config-driven elements.
  $$('[data-config]').forEach(el=>{
    const key=el.getAttribute('data-config');
    if (C[key] != null) el.textContent = C[key];
  });
  $$('a[data-config-href]').forEach(el=>{
    const key=el.getAttribute('data-config-href'); if(C[key]) el.href=C[key];
  });

  // Header menu + dropdowns.
  const menuButton=$('.menu-toggle'); const nav=$('.site-nav');
  if(menuButton && nav){
    menuButton.addEventListener('click',()=>{
      const open=!nav.classList.contains('open'); nav.classList.toggle('open',open); menuButton.classList.toggle('open',open); menuButton.setAttribute('aria-expanded', String(open));
    });
  }
  $$('.nav-dropdown > button').forEach(btn=>btn.addEventListener('click',()=>{
    const parent=btn.closest('.nav-dropdown'); $$('.nav-dropdown.open').forEach(other=>{if(other!==parent){other.classList.remove('open'); const ob=other.querySelector(':scope > button'); if(ob)ob.setAttribute('aria-expanded','false');}}); const open=parent.classList.toggle('open'); btn.setAttribute('aria-expanded',String(open));
  }));
  document.addEventListener('click',e=>{
    if(!e.target.closest('.nav-dropdown')) $$('.nav-dropdown.open').forEach(d=>{d.classList.remove('open'); const b=d.querySelector(':scope > button'); if(b)b.setAttribute('aria-expanded','false');});
  });


  $$('.site-nav a').forEach(link=>link.addEventListener('click',()=>{
    if(nav && menuButton && nav.classList.contains('open')){ nav.classList.remove('open'); menuButton.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); }
  }));

  // Accordions.
  $$('.accordion-button').forEach(btn=>btn.addEventListener('click',()=>{
    const item=btn.closest('.accordion-item'); const open=item.classList.toggle('open'); btn.setAttribute('aria-expanded',String(open)); const sign=$('span:last-child',btn); if(sign) sign.textContent=open?'−':'+';
  }));

  // Reveal observer.
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible'); io.unobserve(e.target)}}),{threshold:.08});
    $$('.reveal').forEach(el=>io.observe(el));
  } else $$('.reveal').forEach(el=>el.classList.add('is-visible'));

  // Modal helpers.
  const body=document.body;
  function openDialog(id){ const d=document.getElementById(id); if(!d)return; if(typeof d.showModal==='function') d.showModal(); else d.setAttribute('open',''); body.classList.add('modal-open'); d.setAttribute('aria-hidden','false'); }
  function closeDialog(d){ if(!d)return; if(typeof d.close==='function') d.close(); else d.removeAttribute('open'); body.classList.remove('modal-open'); d.setAttribute('aria-hidden','true'); }
  $$('[data-dialog-close]').forEach(btn=>btn.addEventListener('click',()=>closeDialog(btn.closest('dialog'))));
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)closeDialog(d)}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$$('dialog[open]').forEach(closeDialog)}});

  // Date controls: no past dates for booking.
  const dateInputs=$$('input[type=date]');
  const today=new Date(); const iso=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10); dateInputs.forEach(i=>i.min=iso);

  function validPhone(v){ return /^(?:\+91\s?)?[6-9]\d{9}$/.test(v.replace(/[\-()]/g,'')); }
  function formDataObject(form){
    const fd=new FormData(form); const o={}; fd.forEach((v,k)=>{if(k!=='website')o[k]=String(v).trim()}); return o;
  }
  async function maybeEndpoint(payload){
    if(!C.formEndpoint) return;
    try{ await fetch(C.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true,mode:'cors'}); }catch(e){ /* WhatsApp remains the primary contact path */ }
  }
  function whatsappMessage(type, data){
    const lines=[];
    if(type==='booking'){
      lines.push('Hello Rituparna\'z Makeup Art & Academy, I would like to enquire about a booking.');
      lines.push('Name: '+data.name); lines.push('Event: '+data.event); lines.push('Service: '+data.service); lines.push('Location: '+data.location); lines.push('Preferred date: '+data.date); lines.push('Preferred time: '+data.time);
    } else if(type==='enrollment'){
      lines.push('Hello Rituparna\'z Makeup Art & Academy, I am interested in the Basic to Advanced Professional Makeup Course.');
      lines.push('Name: '+data.name); lines.push('Phone: '+data.phone); if(data.email) lines.push('Email: '+data.email); if(data.message) lines.push('Message: '+data.message);
    } else {
      lines.push('Hello Rituparna\'z Makeup Art & Academy, I have an enquiry.');
      lines.push('Name: '+data.name); lines.push('Phone: '+data.phone); if(data.email) lines.push('Email: '+data.email); if(data.service) lines.push('Service: '+data.service); if(data.message) lines.push('Message: '+data.message);
    }
    lines.push(''); lines.push('Sent from: '+location.href);
    return 'https://wa.me/'+C.whatsapp+'?text='+encodeURIComponent(lines.join('\n'));
  }
  function setupForm(form){
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const status=$('[data-form-status]',form); if(status) status.textContent='';
      const data=formDataObject(form);
      if(form.website && form.website.value){ return; }
      if(!data.name || !data.phone || !validPhone(data.phone)){ if(status) status.textContent='Please enter your name and a valid 10-digit Indian mobile number.'; return; }
      if(form.dataset.form==='booking'){
        if(!data.event || !data.location || !data.date || !data.time || !data.service){ if(status) status.textContent='Please complete the event, service, location, date and time fields.'; return; }
        track('form_submit',{form_type:'booking',service:data.service});
        window.open(whatsappMessage('booking',data),'_blank','noopener'); track('whatsapp_click',{service:data.service,context:'booking'});
        void maybeEndpoint({...data,...attribution,form_type:'booking'}); closeDialog(form.closest('dialog')); return;
      }
      if(form.dataset.form==='enrollment'){
        track('form_submit',{form_type:'enrollment',service:'Makeup Training & Certification'}); if(status) status.textContent='Opening WhatsApp with your enrolment details…';
        window.open(whatsappMessage('enrollment',data),'_blank','noopener'); track('whatsapp_click',{service:'Makeup Training & Certification',context:'enrollment'});
        void maybeEndpoint({...data,...attribution,form_type:'enrollment'}); closeDialog(form.closest('dialog')); return;
      }
      track('form_submit',{form_type:'contact',service:data.service||'General Enquiry'});
      window.open(whatsappMessage('contact',data),'_blank','noopener'); track('whatsapp_click',{service:data.service||'General Enquiry',context:'contact'});
      void maybeEndpoint({...data,...attribution,form_type:'contact'});
      if(status) status.textContent='WhatsApp is ready with your enquiry. Send the message to complete the enquiry.';
    });
    $$('input,select,textarea',form).forEach(el=>el.addEventListener('focus',()=>track('form_start',{form_type:form.dataset.form}),{once:true}));
  }
  $$('form[data-form]').forEach(setupForm);

  $$('[data-open-booking]').forEach(btn=>btn.addEventListener('click',()=>{
    const service=btn.getAttribute('data-service'); const select=$('#booking-service'); if(select&&service){[...select.options].forEach(o=>o.selected=false); const opt=[...select.options].find(o=>o.value===service || o.text===service); if(opt) opt.selected=true; }
    openDialog('booking-dialog'); track('cta_click',{cta:'book_now',service:service||'General Enquiry'});
  }));
  $$('[data-open-enrollment]').forEach(btn=>btn.addEventListener('click',()=>{openDialog('enroll-dialog'); track('cta_click',{cta:'enroll_now',service:'Makeup Training & Certification'});}));

  if(params.get('enroll')==='1') setTimeout(()=>openDialog('enroll-dialog'), 320);

  // Lightbox for work imagery.
  const lb=document.getElementById('lightbox-dialog'), lbImg=document.getElementById('lightbox-image'), lbCap=$('#lightbox-caption');
  $$('[data-lightbox]').forEach(card=>card.addEventListener('click',()=>{
    const src=card.getAttribute('data-src'), alt=card.getAttribute('data-alt')||''; if(lbImg){lbImg.src=src;lbImg.alt=alt} if(lbCap) lbCap.textContent=card.getAttribute('data-caption')||''; if(lb)openDialog('lightbox-dialog');
  }));

  // Contextual event tracking.
  $$('[data-track]').forEach(el=>el.addEventListener('click',()=>{
    track(el.dataset.track,{service:el.dataset.service||undefined,location:el.dataset.location||undefined});
  }));

  $$('a[href^="tel:"]').forEach(el=>el.addEventListener('click',()=>track('call_click')));
  $$('a[href*="wa.me/"]').forEach(el=>el.addEventListener('click',()=>track('whatsapp_click',{context:'direct_link'})));
  $$('a[data-map]').forEach(el=>el.addEventListener('click',()=>track('map_click')));

  // Make service dropdown available on touch; close on Escape is handled above.
})();
