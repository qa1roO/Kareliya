mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rudyborman97/cmadrya3y00qy01s5ezf1hqyn',
    center: [30.574000, 61.947680],
    zoom: 14.8
});
map.on('load', () => {
    fetch('geojs/point_all.geojsonl.json?nocache=' + Date.now())
    .then(res => res.text())
    .then(text => {
      const features = text
        .trim()
        .split(/\r?\n/)
        .filter(line => line)
        .map(line => JSON.parse(line));

      // 1) Собираем маркеры сразу по группам id
        const markersById = {};

        features.forEach(feat => {
        const { id, image, name } = feat.properties;
        const [lng, lat] = feat.geometry.coordinates;

        // 1) Контейнер фиксированного размера, без position:relative
        const container = document.createElement('div');
        container.style.width       = '24px';
        container.style.height      = '24px';
        container.style.overflow    = 'visible';  // чтобы img мог выходить за границы
        // убираем position:relative!

        // 2) Иконка внутри
        const imgEl = document.createElement('img');
        imgEl.src            = `images/Icons_map3/${image}`;
        imgEl.alt            = name;
        imgEl.style.width    = '24px';
        imgEl.style.height   = '24px';
        imgEl.style.objectFit       = 'contain';
        imgEl.style.cursor          = 'pointer';
        imgEl.style.transition      = 'transform 0.2s ease';
        imgEl.style.transformOrigin = 'center center';

        // 3) Hover‑эффект только на img
        imgEl.addEventListener('mouseenter', () => {
            imgEl.style.transform = 'scale(2.5)';
            container.style.zIndex = '1000';
        });
        imgEl.addEventListener('mouseleave', () => {
            imgEl.style.transform = 'scale(1)';
            container.style.zIndex = '';
        });

        container.appendChild(imgEl);

        // 4) Правильный конструктор: options = { element, anchor, offset }
        const marker = new mapboxgl.Marker({
            element: container,
            anchor: 'center',
            offset: [0, 0]
        })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(name))
            .addTo(map);
        // Группируем по id в массив
        if (!markersById[id]) markersById[id] = [];
        markersById[id].push(marker);
      });

      // 2) Привязываем переключатели
      document.querySelectorAll('.checkbox-item input[type=checkbox]')
        .forEach(cb => {
          const fid = cb.id;         // теперь id чекбокса точно совпадает с JSON
          cb.checked = true;         // включены по умолчанию

          cb.addEventListener('change', () => {
            (markersById[fid] || []).forEach(marker => {
              if (cb.checked) marker.addTo(map);
              else            marker.remove();
            });
          });
        });
    })
    .catch(err => console.error(err));

    fetch('geojs/Poligon_tem.geojsonl.json')
    .then(res => res.text())
    .then(text => {
        const polyFeatures = text
            .trim()
            .split(/\r?\n/)
            .filter(l => l)
            .map(l => JSON.parse(l));

        const polyGeoJSON = {
            type: 'FeatureCollection',
            features: polyFeatures
        };
        map.on('click', 'polygons-interaction', e => {
        const feature = e.features[0];
        const props = feature.properties;

        // Вставляем данные в сайдбар
        document.getElementById('sidebar-title').textContent = props.name || 'Без названия';
        document.getElementById('sidebar-description').textContent = props.description || 'Описание отсутствует';
        document.getElementById('sidebar-image').src = 'images/map3_img/' + (props.image || 'placeholder.jpg');

        // Показываем сайдбар
        document.getElementById('sidebar').classList.add('active');
        });

        map.addSource('polygons-source', {
        type: 'geojson',
        data: polyGeoJSON,
        generateId: true
        });

        // слой только с линиями
        map.addLayer({
        id: 'polygons-interaction',
        type: 'fill',
        source: 'polygons-source',
        paint: { 'fill-opacity': 0 }
        });

        // контур
        map.addLayer({
            id: 'polygons-outline',
            type: 'line',
            source: 'polygons-source',
            paint: {
                'line-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    '#00FF00',
                    '#FF4500'
                ],
                'line-width': 2,
                'line-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0
                ]
            }
        });

        let hoveredFeatureId = null;

        map.on('mouseenter', 'polygons-interaction', e => {
        map.getCanvas().style.cursor = 'pointer';
        const mbId = e.features[0].id;
        if (hoveredFeatureId !== null) {
            map.setFeatureState(
            { source: 'polygons-source', id: hoveredFeatureId },
            { hover: false }
            );
        }
        hoveredFeatureId = mbId;
        map.setFeatureState(
            { source: 'polygons-source', id: mbId },
            { hover: true }
        );
        });

        map.on('mouseleave', 'polygons-interaction', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredFeatureId !== null) {
            map.setFeatureState(
            { source: 'polygons-source', id: hoveredFeatureId },
            { hover: false }
            );
            hoveredFeatureId = null;
        }
        });
    })
    .catch(err => console.error('Не удалось загрузить полигоны:', err));
});