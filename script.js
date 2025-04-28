mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rudyborman97/cm8voxls800k701s9g4agaehk',
    center: [30.587858, 61.775442],
    zoom: 8
});



// Загружаем данные маркеров из внешнего файла
fetch('markers.json?' + new Date().getTime())
  .then(response => {
    if (!response.ok) throw new Error('Не удалось загрузить markers.json');
    return response.json();
  })
  .then(markersData => {
    markersData.forEach(data => {
      // Создаём элемент маркера
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundImage = `url(${data.image})`;

      // Попап при hover
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        maxWidth: '400px'
      })
      .setLngLat(data.coordinates)
      .setHTML(`<h3>${data.title}</h3><p>${data.description}</p>`);

      // Маркер
      const marker = new mapboxgl.Marker(el)
        .setLngLat(data.coordinates)
        .addTo(map);

      // Hover события
      el.addEventListener('mouseenter', () => popup.addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());

      // Click для сайдбара
      el.addEventListener('click', () => {
        document.getElementById('sidebar-title').textContent = data.title;
        document.getElementById('sidebar-description').textContent = data.description;
        document.getElementById('sidebar').classList.add('active');
      });
    });
  })
  .catch(err => console.error(err));

// Добавляем контролы
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new mapboxgl.FullscreenControl());

// Функции сайдбара
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('active');
}