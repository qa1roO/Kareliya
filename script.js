mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rudyborman97/cm8voxls800k701s9g4agaehk',
    center: [30.587858, 61.775442],
    zoom: 8
});

// Данные для маркеров
const markersData = [
    {
        coordinates: [30.587858, 61.775442],
        image: 'waterfall.png',
        title: 'Мой маркер',
        description: 'Это маркер с кастомной иконкой'
    },
    {
        coordinates: [30.6, 61.8],
        image: 'waterfall.png',
        title: 'Гора',
        description: 'Красивый вид на гору'
    },  
    {
        coordinates: [30.7, 61.9],
        image: 'waterfall.png',
        title: 'Озеро',
        description: 'Спокойное озеро для отдыха'
    }
];

// Функция для создания маркеров
markersData.forEach(data => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(${data.image})`;

    // Создаем попап
    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
        .setLngLat(data.coordinates)
        .setHTML(`<h3>${data.title}</h3><p>${data.description}</p>`);

    const marker = new mapboxgl.Marker(el)
        .setLngLat(data.coordinates)
        .addTo(map);

    // Показываем попап при наведении
    el.addEventListener('mouseenter', () => {
        popup.addTo(map);
    });

    // Убираем попап при уходе курсора
    el.addEventListener('mouseleave', () => {
        popup.remove();
    });
});

// Элементы управления
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new mapboxgl.FullscreenControl());
