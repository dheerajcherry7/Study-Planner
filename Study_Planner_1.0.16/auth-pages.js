// Small helper for the dedicated login/logout landing pages.
(function(){
 const p=location.pathname.replace(/\/+$/,'');
 const is=n=>p.endsWith('/'+n)||p.endsWith('/'+n+'.html');
 if(is('login')){ location.replace('index.html?login=1'); return; }
 if(is('logout')){ try{ localStorage.removeItem('studyplanner.guest'); localStorage.removeItem('dayplanner.sync'); }catch(e){} }
 const b=document.querySelector('[data-auth-action]');
 if(b)b.addEventListener('click',()=>location.href='index.html?login=1');
})();
