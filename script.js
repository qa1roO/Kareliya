mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
// mapbox://styles/rudyborman97/cm8voxls800k701s9g4agaehk
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rudyborman97/cma12usrq00bi01qqbh5q1kpx',
  center: [33.245378488, 63.638475668],
  zoom: 5.03,
  interactive: false
});

map.on('load', () => {
  // Источник и базовые слои
  map.addSource('karelia', {
    type: 'geojson',
    data: 'geojs/bound_karelia_mo.geojson'
  });
  map.addLayer({ id: 'karelia-fill', type: 'fill',    source: 'karelia', paint: { 'fill-color': '#088', 'fill-opacity': 0.3 } });
  map.addLayer({ id: 'karelia-outline', type: 'line', source: 'karelia', paint: { 'line-color': '#006', 'line-width': 2 } });
  // Слой подсветки
  map.addLayer({
    id: 'highlight-fill',
    type: 'fill',
    source: 'karelia',
    paint: { 'fill-color': '#f00', 'fill-opacity': 0.5 },
    filter: ['==', ['get', 'osm_id'], '']
  });

  // Подсветка при наведении на полигон
  map.on('mousemove', 'karelia-fill', e => {
    if (!e.features.length) return;
    const osmId = e.features[0].properties.osm_id;
    map.setFilter('highlight-fill', ['==', ['get', 'osm_id'], osmId]);
  });
  map.on('mouseleave', 'karelia-fill', () => {
    map.setFilter('highlight-fill', ['==', ['get', 'osm_id'], '']);
  });

  // Считываем GeoJSON и строим словарь {короткоеИмя: osm_id}
  fetch('geojs/bound_karelia_mo.geojson')
    .then(r => r.json())
    .then(fc => {
      const nameToId = {};
      fc.features.forEach(feat => {
        const fullName  = feat.properties.name;       // например "Кондопожский район"
        const shortName = fullName.split(' ')[0];     // "Кондопожский"
        nameToId[shortName] = feat.properties.osm_id;
      });

      // Навешиваем hover на кнопки
      document.querySelectorAll('.place-btn').forEach(btn => {
        // берем из текста кнопки только первое слово
        const labelShort = btn.textContent.trim().split(' ')[0];

        btn.addEventListener('mouseenter', () => {
          const id = nameToId[labelShort];
          if (id) {
            map.setFilter('highlight-fill', ['==', ['get', 'osm_id'], id]);
          }
        });
        btn.addEventListener('mouseleave', () => {
          map.setFilter('highlight-fill', ['==', ['get', 'osm_id'], '']);
        });
      });
    });
});

// map.scrollZoom.disable();      // прокрутка колёсиком
// map.boxZoom.disable();         // зум рамкой
// map.dragRotate.disable();      // вращение правой кнопкой мыши
// map.dragPan.disable();         // перетаскивание карты
// map.keyboard.disable();        // клавиатурные стрелки и +/- 
// map.doubleClickZoom.disable(); // зум двойным щелчком
// map.touchZoomRotate.disable(); // жесты на тачскринах
