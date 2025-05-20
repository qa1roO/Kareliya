// глобальные переменные
let allPois = [];

// 1) Загружаем JSON сразу при старте
fetch('poi.json')
  .then(res => res.json())
  .then(data => {
    allPois = data;
  })
  .catch(err => console.error('Ошибка загрузки poi.json', err));

// 2) Обработчики кнопок
document.querySelectorAll('.place-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const region = btn.textContent.trim();
    renderPois(region);
  });
});

// 3) Функция отрисовки
function renderPois(region) {
  const container = document.getElementById('poi-list');
  container.innerHTML = '';

  const list = allPois.filter(poi => !poi.region || poi.region === region);

  if (list.length === 0) {
    container.innerHTML = `<p>Для района «${region}» ничего не найдено.</p>`;
    return;
  }

  list.forEach(poi => {
    const item = document.createElement('div');
    item.className = 'poi-item';

    item.innerHTML = `
      <div class="poi-image">
        <img src="${poi.image}" alt="${poi.title}">
      </div>
      <div class="poi-text">
        <h3>${poi.title}</h3>
        <p>${poi.description}</p>
        <button class="more-btn">Узнать больше</button>
      </div>
    `;

    item.querySelector('.more-btn').addEventListener('click', () => {
      openModal(poi);
    });

    container.appendChild(item);
  });
}
function openModal(poi) {
  // базовые поля
  document.getElementById('modal-title').textContent = poi.title;
  document.getElementById('modal-description').textContent = poi.description;

  // основное изображение
  const img = document.getElementById('modal-image');
  img.src = poi.image;
  img.alt = poi.title;

  // новые поля
  document.getElementById('modal-location').textContent = poi.location || '—';
  document.getElementById('modal-time').textContent     = poi.time     || '—';
  document.getElementById('modal-cost').textContent     = poi.cost     || '—';

  // показать модалку
  document.getElementById('modal').classList.remove('hidden');
}


document.querySelector('.close-btn').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
});

// 4) По-умолчанию можно отрисовать первый регион:
window.addEventListener('load', () => {
  const firstBtn = document.querySelector('.place-btn');
  if (firstBtn) firstBtn.click();
});
