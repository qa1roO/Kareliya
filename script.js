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
        coordinates: [30.579844, 61.948724],
        image: 'waterfall.png',
        title: 'Горный парк Рускеала',
        description: 'Это маркер с кастомной иконкой'
    },
    {
        coordinates: [30.784599, 61.994121],
        image: 'waterfall.png',
        title: 'Гора',
        description: 'Красивый вид на гору'
    },  
    {
        coordinates: [30.627224, 61.916244],
        image: 'waterfall.png',
        title: 'Озеро',
        description: 'Спокойное озеро для отдыха'
    },
    {
        coordinates: [30.699328,61.731724],
        image: 'waterfall.png',
        title: 'Озеро',
        description: 'Спокойное озеро для отдыха'
    },
    {
        coordinates: [30.725691, 61.710167],
        image: 'waterfall.png',
        title: 'Озеро',
        description: 'Спокойное озеро для отдыха'
    },
    {
        coordinates: [30.691946, 61.701118],
        image: 'waterfall.png',
        title: 'Озеро',
        description: 'Спокойное озеро для отдыха'
    },
    {
        coordinates: [ 30.681903, 61.700743],
        image: 'waterfall.png',
        title: 'Озеро',
        description: 'Спокойное озеро для отдыха'
    },
    {
        coordinates: [30.944915, 61.388779],
        image: 'waterfall.png',
        title: 'Озеро',
        description: 'Спокойное озеро для отдыха'
    },
    {
        coordinates: [30.700952, 61.623728],
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
    const popup = new mapboxgl.Popup({ 
        offset: 25, 
        closeButton: false, 
        closeOnClick: false,
        maxWidth: '400px'
    })
    .setLngLat(data.coordinates);

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

// Функция для открытия карточки
function openSidebar(title, description) {
    document.getElementById('sidebar-title').textContent = title;
    document.getElementById('sidebar-description').textContent = description;
    document.getElementById('sidebar').classList.add('active');
}

// Функция для закрытия карточки
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
}

// Создаем маркеры
markersData.forEach(data => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(${data.image})`;

    const marker = new mapboxgl.Marker(el)
        .setLngLat(data.coordinates)
        .addTo(map);

    // Открываем карточку при клике
    el.addEventListener('click', () => {
        openSidebar(data.title, data.description);
    });
});

