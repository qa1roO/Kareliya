mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rudyborman97/cmadrya3y00qy01s5ezf1hqyn',
  center: [30.574000, 61.947680],
  zoom: 14.8
});
let map1 = null;
let map1Initialized = false;
const initialView = { center: [30.574000, 61.947680], zoom: 14.8 };
const targetView = { center: [30.576357, 61.948215], zoom: 16.7 };
document.getElementById('toggle-map-btn').addEventListener('click', () => {
  const el0 = document.getElementById('map');
  const el1 = document.getElementById('map1');
  const showingMap0 = el0.style.display !== 'none';
  const toggleBtn = document.getElementById('toggle-map-btn');
  if (showingMap0) {
    el0.style.display = 'none';
    el1.style.display = 'block';
    toggleBtn.textContent = 'Показать надземную Рускеалу';

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

            map1.addLayer({
              id: 'under-interaction',
              type: 'fill',
              source: 'under-source',
              paint: { 'fill-opacity': 0 }
            });

            map1.addLayer({
              id: 'under-outline',
              type: 'line',
              source: 'under-source',
              paint: {
                'line-color': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  '#FF0000',
                  '#9053ec'
                ],
                'line-width': 3,
                'line-opacity': 0.7
              }
            });
            map1.addLayer({
              id: 'under-glow',
              type: 'line',
              source: 'under-source',
              beforeId: 'under-outline',
              paint: {
                'line-color': '#9053ec',  // цвет свечения
                'line-width': 10,         // насколько широко светит
                'line-blur': 4,           // степень размытия
                'line-opacity': 0.1       // прозрачность свечения
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
              document.getElementById('sidebar-title').textContent = props.name;
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
    toggleBtn.textContent = 'Показать подземную Рускеалу';
  }
  // перед созданием слоя маршрутов
  const undCheckbox = document.getElementById('underground1');
  if (undCheckbox) undCheckbox.checked = false;
  const visibleUndRouteIds = new Set();
  if (undCheckbox.checked) visibleUndRouteIds.add('underground1');

  fetch('geojs/routs_und.geojsonl.json?nocache=' + Date.now())
    .then(res => res.text())
    .then(text => {
      const features = text.trim().split(/\r?\n/).map(l => JSON.parse(l));
      const geojson = { type: 'FeatureCollection', features };

      map1.addSource('routs-und-source', {
        type: 'geojson',
        data: geojson,
        generateId: true
      });



      map1.addLayer({
        id: 'routs-und-line',
        type: 'line',
        source: 'routs-und-source',
        filter: ['in', ['get', 'id'], ['literal', Array.from(visibleUndRouteIds)]],
        paint: {
          'line-color': '#e22bcd',
          'line-width': 2,
          'line-opacity': 0.9
        }
      });


      const undCheckbox = document.getElementById('underground1');
      if (undCheckbox) {
        undCheckbox.addEventListener('change', () => {
          if (undCheckbox.checked) {
            visibleUndRouteIds.add('underground1');
          } else {
            visibleUndRouteIds.delete('underground1');
          }

          map1.setFilter('routs-und-line', ['in', ['get', 'id'], ['literal', Array.from(visibleUndRouteIds)]]);
        });
      }
    })
    .catch(err => console.error('Не удалось загрузить пещерный маршрут:', err));
});
function toggleMaps() {
  document.getElementById('toggle-map-btn').click();
}
const caveEntryCheckbox = document.getElementById('exc2');
if (caveEntryCheckbox) {
  caveEntryCheckbox.addEventListener('change', e => {
    // Только на включение, а не на выключение
    if (e.target.checked) {
      toggleMaps();
    }
  });
  // Лейбл тоже
  const caveEntryLabel = document.querySelector('label[for="exc2"]');
  if (caveEntryLabel) {
    caveEntryLabel.addEventListener('click', () => {
      // небольшая задержка, чтобы checkbox уже сменил своё checked
      setTimeout(() => {
        if (caveEntryCheckbox.checked) toggleMaps();
      }, 0);
    });
  }
}
map.on('load', () => {
  map.on('click', (e) => {
    const hits = map.queryRenderedFeatures(e.point, { layers: ['polygons-interaction'] });
    if (hits.length === 0) {
      document.getElementById('sidebar').classList.remove('active');
    }
  });
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
        container.style.width = '24px';
        container.style.height = '24px';
        container.style.overflow = 'visible';  // чтобы img мог выходить за границы
        // убираем position:relative!

        // 2) Иконка внутри
        const imgEl = document.createElement('img');
        imgEl.src = `images/Icons_map3/${image}`;
        imgEl.alt = name;
        imgEl.style.width = '24px';
        imgEl.style.height = '24px';
        imgEl.style.objectFit = 'contain';
        imgEl.style.cursor = 'pointer';
        imgEl.style.transition = 'transform 0.2s ease';
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
          const fid = cb.id;

          // Эти три чекбокса будут выключены по умолчанию
          const initiallyUnchecked = ['ground1', 'ground2', 'underground1'];
          cb.checked = !initiallyUnchecked.includes(fid);

          (markersById[fid] || []).forEach(marker => {
            if (cb.checked) marker.addTo(map);
            else marker.remove();
          });

          cb.addEventListener('change', () => {
            (markersById[fid] || []).forEach(marker => {
              if (cb.checked) marker.addTo(map);
              else marker.remove();
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
          'line-width': 1.5,
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.5,
            0
          ]
        }
      });
      map.addLayer({
        id: 'polygons-glow',
        type: 'line',
        source: 'polygons-source',
        // чтобы глоу рисовался ПОЗАДИ основного полигона
        beforeId: 'polygons-outline',
        paint: {
          'line-color': '#32CD32', // цвет свечения
          'line-width': 10,        // насколько широко светит
          'line-blur': 8,          // степень размытия
          'line-opacity': 0.6      // прозрачность свечения
        }
      });
      fetch('geojs/routs.geojsonl.json?nocache=' + Date.now())
        .then(res => res.text())
        .then(text => {

          const routeFeatures = text
            .trim()
            .split(/\r?\n/)
            .filter(l => l)
            .map(l => JSON.parse(l));
          const routesGeoJSON = {
            type: 'FeatureCollection',
            features: routeFeatures
          };

          map.addSource('routes-source', {
            type: 'geojson',
            data: routesGeoJSON,
            generateId: true
          });

          let visibleRouteIds = new Set();
          document.querySelectorAll('.checkbox-item input[type=checkbox]').forEach(cb => {
            if (cb.checked) visibleRouteIds.add(cb.id);
          });

          const routeFilter = ['in', ['get', 'id'], ['literal', Array.from(visibleRouteIds)]];
          map.addLayer({
            id: 'routes-line',
            type: 'line',
            source: 'routes-source',
            filter: routeFilter,
            paint: {
              'line-color': [
                'match',
                ['get', 'id'],
                'ground1', '#E05858',
                'ground2', '#1E4E9D',
                '#AAAAAA'
              ],
              'line-width': 1.5,
              'line-opacity': 1,
              'line-dasharray': [
                'case',
                ['==', ['get', 'fid'], 1],
                [2, 2],
                [1, 0]
              ]
            }
          });

          document.querySelectorAll('.checkbox-item input[type=checkbox]').forEach(cb => {
            cb.addEventListener('change', () => {
              const id = cb.id;
              if (cb.checked) {
                visibleRouteIds.add(id);
              } else {
                visibleRouteIds.delete(id);
              }

              // Обновляем фильтр на слое
              map.setFilter('routes-line', ['in', ['get', 'id'], ['literal', Array.from(visibleRouteIds)]]);
            });
          });

          // — дальше ваши popups и hover для routes-line
          map.on('click', 'routes-line', e => {
            const props = e.features[0].properties;
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`<strong>${props.name}</strong>`)
              .addTo(map);
          });
          map.on('mouseenter', 'routes-line', () => map.getCanvas().style.cursor = 'pointer');
          map.on('mouseleave', 'routes-line', () => map.getCanvas().style.cursor = '');
        })
        .catch(err => console.error('Не удалось загрузить маршруты:', err));
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
