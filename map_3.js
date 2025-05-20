mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rudyborman97/cmadrya3y00qy01s5ezf1hqyn',
    center: [30.574000, 61.947680],
    zoom: 14.8
});

// 2. Переменные для второй
let map1 = null;
let map1Initialized = false;
const initialView = { center: [30.574000, 61.947680], zoom: 14.8 };
const targetView  = { center: [30.576357, 61.948215], zoom: 16.7 };
// 3. Кнопка переключения
document.getElementById('toggle-map-btn').addEventListener('click', () => {
  const el0 = document.getElementById('map');
  const el1 = document.getElementById('map1');
  const showingMap0 = el0.style.display !== 'none';

  if (showingMap0) {
    el0.style.display = 'none';
    el1.style.display = 'block';

    if (!map1Initialized) {
      map1 = new mapboxgl.Map({
        container: 'map1',
        style: 'mapbox://styles/rudyborman97/cmawderqw006101scdgm6hvxi',
        center: initialView.center,
        zoom: initialView.zoom
      });
      map1Initialized = true;

      map1.on('load', () => {
        map1.flyTo({
          ...targetView,
          speed: 0.5,
          curve: 1.2,
          essential: true
        });
        fetch('geojs/Poligon_under.geojsonl.json?nocache=' + Date.now())
          .then(res => res.text())
          .then(text => {
          console.log('raw Poligon_under:', text);
          const features = text.trim().split(/\r?\n/).map(l => JSON.parse(l));
          const geojson = { type: 'FeatureCollection', features };

          map1.addSource('under-source', {
            type: 'geojson',
            data: geojson,
            generateId: true
          });

          map1.addLayer({ // прозрачный fill для событий hover
            id: 'under-interaction',
            type: 'fill',
            source: 'under-source',
            paint: { 'fill-opacity': 0 }
          });

          map1.addLayer({ // контур
            id: 'under-outline',
            type: 'line',
            source: 'under-source',
            paint: {
              'line-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#FF0000',
                '#FFD700'
              ],
              'line-width': 2,
              'line-opacity':0.5
            }
          });

          // hover‑состояние
          let hoverId = null;
          map1.on('mouseenter', 'under-interaction', e => {
            map1.getCanvas().style.cursor = 'pointer';
            const id = e.features[0].id;
            if (hoverId !== null) {
              map1.setFeatureState({ source: 'under-source', id: hoverId }, { hover: false });
            }
            hoverId = id;
            map1.setFeatureState({ source: 'under-source', id }, { hover: true });
          });
          map1.on('mouseleave', 'under-interaction', () => {
            map1.getCanvas().style.cursor = '';
            if (hoverId !== null) {
              map1.setFeatureState({ source: 'under-source', id: hoverId }, { hover: false });
              hoverId = null;
            }
          });
          map1.on('click', 'under-interaction', (e) => {
            const props = e.features[0].properties;
            console.log('props on click:', props);
            // Если вы хотите открывать даже без description, уберите эту проверку:
            if (!props.description || props.description.trim() === "") return;

            // Логируем входные данные и итоговый путь
            console.log('clicked poly id =', props.id);
            console.log('  props.image =', JSON.stringify(props.image));
            const imgName = props.image && props.image.trim() !== ""
              ? props.image
              : 'placeholder.jpg';
            console.log('  loading image = images/map3_img/' + imgName);

            // заполняем сайдбар
            document.getElementById('sidebar-title').textContent       = props.name;
            document.getElementById('sidebar-description').textContent = props.description;
            document.getElementById('sidebar-image').src =
              'images/map3_img/' + imgName;
            document.getElementById('sidebar-image').alt = props.name || '';
            document.getElementById('sidebar').classList.add('active');
          });


      // клик где угодно — если не на подземке, закрываем сайдбар
      map1.on('click', (e) => {
        const hits = map1.queryRenderedFeatures(e.point, { layers: ['under-interaction'] });
        if (hits.length === 0) {
          document.getElementById('sidebar').classList.remove('active');
        }
      });
      const popupUnder = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
      });

      // при движении мыши над under-interaction – показываем название
      map1.on('mousemove', 'under-interaction', (e) => {
      map1.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      const coords = e.lngLat;

      // если description непустой — не показываем popup
      if (props.description && props.description.trim() !== "") {
        popupUnder.remove();
        return;
      }

      // иначе показываем название
      const name = props.name || 'Без названия';
      popupUnder
        .setLngLat(coords)
        .setText(name)
        .addTo(map1);
    });

      // когда уходим мышью с полигона – скрываем popup
      map1.on('mouseleave', 'under-interaction', () => {
        map1.getCanvas().style.cursor = '';
        popupUnder.remove();
      });
      })
      .catch(err => console.error('Не удалось загрузить Poligon_under:', err));
      });
      
    } else {
      // Сбрасываем мгновенно в начальное положение
      map1.jumpTo(initialView);
      // И сразу запускаем анимацию
      map1.flyTo({
        ...targetView,
        speed: 0.5,
        curve: 1.2,
        essential: true
      });
    }

  } else {
    el1.style.display = 'none';
    el0.style.display = 'block';
  }
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
                    '#FF0000',
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