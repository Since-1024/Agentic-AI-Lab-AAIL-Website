// Language switcher
function setLanguage(lang){
  fetch('assets/lang/'+lang+'.json')
    .then(r=>r.json())
    .then(data=>{
      document.querySelectorAll('[data-lang]').forEach(el=>{
        const key = el.getAttribute('data-lang');
        el.textContent = data[key] || key;
      });
      localStorage.setItem('aail-lang', lang);
    });
}
const saved = localStorage.getItem('aail-lang') || 'en';
setLanguage(saved);
