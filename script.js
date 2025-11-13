// Animation d’apparition des sections
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });

sections.forEach(section => observer.observe(section));


// Accordéon pour les expériences
const expButtons = document.querySelectorAll('.exp-header');

expButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const parent = btn.parentElement;

    // Ferme les autres si on veut un seul ouvert à la fois
    expButtons.forEach(other => {
      if (other !== btn) other.parentElement.classList.remove('active');
    });

    // Active/désactive l'élément cliqué
    parent.classList.toggle('active');
  });
});


