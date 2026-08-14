document.addEventListener('DOMContentLoaded', ()=>{
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = Array.from(nav.querySelectorAll('a'));
  const getTarget = (href)=>{
    if(!href || href === '#') return document.querySelector('.hero');
    try{ return document.querySelector(href); }catch(e){ return null }
  };
  const sections = links.map(l=>getTarget(l.getAttribute('href')));

  // Mobile toggle
  toggle.addEventListener('click', ()=>{
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  // Smooth scroll (only for same-page anchors). Let external and multi-page links navigate normally.
  links.forEach(link=>{
    link.addEventListener('click', (e)=>{
      const href = link.getAttribute('href') || '';
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      const hrefPage = href.split('#')[0] || '';

      // External links (http/https) — allow browser to handle
      if(/^https?:\/\//i.test(href)) return;

      // If href points to a different HTML page, allow normal navigation
      if(hrefPage && hrefPage !== '' && hrefPage !== currentPage && hrefPage.endsWith('.html')) return;

      // Otherwise handle as same-page anchor (including index.html -> '#...' or '#')
      e.preventDefault();
      nav.classList.remove('open');
      const target = getTarget(href);
      if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
      // update URL without causing navigation
      history.replaceState(null,'', href);
    });
  });

  // Active link on scroll
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      const id = ent.target.id ? ('#'+ent.target.id) : '#';
      if(ent.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const link = nav.querySelector(`a[href="${id}"]`);
        if(link) link.classList.add('active');
      }
    });
  },{root:null,threshold:0.5});

  sections.forEach(s=>{ if(s) obs.observe(s); });

  // initial active on load
  function setActiveOnLoad(){
    // prefer matching current filename (separate pages)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let found=false;
    for(let i=0;i<links.length;i++){
      const href = links[i].getAttribute('href') || '';
      const norm = (href === '#' || href === '' ) ? 'index.html' : href.split('/').pop();
      if(norm === currentPage){ links.forEach(l=>l.classList.remove('active')); links[i].classList.add('active'); found=true; break; }
    }
    if(found) return;

    // fallback: check visible sections
    for(let i=0;i<sections.length;i++){
      const s=sections[i]; if(!s) continue;
      const r=s.getBoundingClientRect();
      if(r.top<=window.innerHeight*0.5 && r.bottom>=window.innerHeight*0.25){
        links.forEach(l=>l.classList.remove('active'));
        links[i].classList.add('active'); found=true; break;
      }
    }
    if(!found){ links.forEach(l=>l.classList.remove('active')); const home = nav.querySelector('a[href="index.html"]') || nav.querySelector('a[href="#"]'); if(home) home.classList.add('active'); }
  }
  setActiveOnLoad();

  // contact form submit -> prefer service endpoint (Formspree) or Netlify forms
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', async (e)=>{
      const form = e.target;
      const resultEl = document.getElementById('form-result');
      const action = (form.getAttribute('action')||'').trim();

      // If using Netlify forms (data-netlify="true"), allow the browser to submit normally
      if(form.dataset && form.dataset.netlify === 'true'){
        return; // let Netlify handle the submission
      }

      e.preventDefault();

      if(!action || action.includes('{YOUR_FORM_ID}')){
        if(resultEl) resultEl.textContent = 'Form endpoint not configured. Create a Formspree form and paste the endpoint into the form action.';
        return;
      }

      try{
        if(resultEl) resultEl.textContent = 'Sending...';
        const formData = new FormData(form);
        const res = await fetch(action, {method:'POST', body: formData, headers: { 'Accept': 'application/json' }});
        if(res.ok){
          if(resultEl) { resultEl.textContent = 'Thanks — your message was sent.'; resultEl.style.color = '' }
          form.reset();
        } else {
          const data = await res.json().catch(()=>null);
          if(resultEl) resultEl.textContent = (data && data.error) ? data.error : 'There was an error sending the message.';
        }
      }catch(err){
        if(resultEl) resultEl.textContent = 'Network error. Please try again later.';
      }
    });
  }

  // Year in footer
  const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();
});
