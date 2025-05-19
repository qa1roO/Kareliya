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
  container.innerHTML = ''; // чистим предыдущий список

  // Если в JSON будут регионы, фильтруйте по ним. 
  // Пока JSON не содержит поля region, просто покажем все.
  const list = allPois
    .filter(poi => !poi.region || poi.region === region);

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
      </div>
    `;
    container.appendChild(item);
  });
}

// 4) По-умолчанию можно отрисовать первый регион:
window.addEventListener('load', () => {
  const firstBtn = document.querySelector('.place-btn');
  if (firstBtn) firstBtn.click();
});
