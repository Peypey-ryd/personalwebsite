document.addEventListener('DOMContentLoaded', ()=>{
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = Array.from(nav.querySelectorAll('a'));
  const sections = links.map(l=>document.querySelector(l.getAttribute('href')));

  // Mobile toggle
  toggle.addEventListener('click', ()=>{
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  // Smooth scroll
  links.forEach(link=>{
    link.addEventListener('click', (e)=>{
      e.preventDefault();
      nav.classList.remove('open');
      const target = document.querySelector(link.getAttribute('href'));
      target.scrollIntoView({behavior:'smooth',block:'start'});
      history.replaceState(null,'',link.getAttribute('href'));
    });
  });

  // Active link on scroll
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      const id = '#'+ent.target.id;
      const link = nav.querySelector(`a[href="${id}"]`);
      if(ent.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        if(link) link.classList.add('active');
      }
    });
  },{root:null,threshold:0.5});

  sections.forEach(s=>{ if(s) obs.observe(s); });

  // Year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
});
