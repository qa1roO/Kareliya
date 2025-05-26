mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rudyborman97/cm8voxls800k701s9g4agaehk',
  center: [30.587858, 61.775442],
  zoom: 8
});
const exploreBtn = document.getElementById('explore-btn');
const originalHref = exploreBtn.getAttribute('href');
exploreBtn.classList.add('disabled');
exploreBtn.removeAttribute('href');

document.querySelector('.point').addEventListener('click', () => {
  const legend = document.getElementById('legend-panel');
  legend.classList.toggle('active');
});

const allMarkers = [];

fetch('markers.json?' + Date.now())
  .then(res => {
    if (!res.ok) throw new Error(res.status);
    return res.json();
  })
  .then(markers => {
    markers.forEach(m => {
      // 1) создаём DOM-элемент и маркер
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '45px';
      el.style.height = '45px';
      el.style.backgroundImage = `url(${m.image})`;
      el.style.backgroundSize = 'contain';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(m.coordinates)
        .addTo(map);

      allMarkers.push({ marker, id: m.id });


      el.addEventListener('mouseenter', () => {
  
        el.style.width = '80px';
        el.style.height = '80px';
        el.style.zIndex = '1000'; 
        popup.setLngLat(m.coordinates).addTo(map);
      });

      el.addEventListener('mouseleave', () => {
        el.style.width = '45px';
        el.style.height = '45px';
        el.style.zIndex = '';
        popup.remove();
      });
      // 2) готовим pop-up с title
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setText(m.title);

      el.addEventListener('mouseenter', () => popup.setLngLat(m.coordinates).addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());

      el.addEventListener('click', () => {
        if (m.image === 'images/icons/Poi_ruskeala_B.png') {
          exploreBtn.classList.remove('disabled');
          exploreBtn.setAttribute('href', originalHref);
        } else {
          exploreBtn.classList.add('disabled');
          exploreBtn.removeAttribute('href');
        }

        const hname = document.getElementById('dynamic-title');
        const descElem = document.getElementById('dynamic-description');
        const imagesContainer = document.querySelector('.description-images');

        hname.classList.add('fade-out');
        descElem.classList.add('fade-out');
        imagesContainer.classList.add('fade-out');

        setTimeout(() => {
          hname.textContent = m.title;
          descElem.textContent = m.description;
          imagesContainer.innerHTML = '';
          if (Array.isArray(m.images)) {
            m.images.forEach(src => {
              const img = document.createElement('img');
              img.src = src;
              img.alt = m.title;
              imagesContainer.appendChild(img);
            });
          }
          hname.classList.remove('fade-out');
          descElem.classList.remove('fade-out');
          imagesContainer.classList.remove('fade-out');
        }, 300);
      });


    });
    const checkboxes = document.querySelectorAll('.legend-panel input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedIds = Array.from(checkboxes)
          .filter(ch => ch.checked)
          .map(ch => ch.dataset.id);

        // Показываем/скрываем маркеры
        allMarkers.forEach(({ marker, id }) => {
          marker.getElement().style.display = checkedIds.includes(id) ? '' : 'none';
        });

        // Показываем/скрываем полигон по purple
        const purpleCb = document.querySelector('input[data-id="purple"]');
        if (purpleCb) {
          const vis = purpleCb.checked ? 'visible' : 'none';
          ['ladoga-park-fill', 'ladoga-park-outline', 'ladoga-park-highlight']
            .forEach(layer => map.setLayoutProperty(layer, 'visibility', vis));
        }
      });
    });
  })
  .catch(err => console.error(err));
// Загружаем GeoJSON-полигон

map.on('load', () => {
  fetch('geojs/LADOGA_PARK.geojson?' + Date.now())
    .then(res => res.json())
    .then(data => {
      // Добавляем geojson как источник
      map.addSource('ladoga-park', {
        type: 'geojson',
        data: data
      });

      // Добавляем слой полигона
      map.addLayer({
        id: 'ladoga-park-fill',
        type: 'fill',
        source: 'ladoga-park',
        layout: {},
        paint: {
          'fill-color': '#39a200', // цвет полигона
          'fill-opacity': 0.3,
        }
      });
      map.addLayer({
        id: 'ladoga-park-outline',
        type: 'line',
        source: 'ladoga-park',
        layout: {},
        paint: {
          'line-color': '#0b5c00', // цвет контура
          'line-width': 1
        }
      });

      map.addLayer({
        id: 'ladoga-park-highlight',
        type: 'fill',
        source: 'ladoga-park',
        paint: {
          'fill-color': '#CC0000',
          'fill-opacity': 0.4
        },
        filter: ['==', ['get', 'full_id'], ''] // сначала вообще ничего показываем
      });

      // popup при наведении
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      let hoveredId = null;

      map.on('mousemove', 'ladoga-park-fill', (e) => {
        const fid = e.features[0].properties.full_id;
        map.setFilter('ladoga-park-highlight', ['==', ['get', 'full_id'], fid]);
      });
      map.on('mouseleave', 'ladoga-park-fill', () => {
        map.setFilter('ladoga-park-highlight', ['==', ['get', 'full_id'], '']);
      });
      map.on('click', 'ladoga-park-fill', (e) => {
        const props = e.features[0].properties;
        const title = props.name || 'Ладожский парк';
        const description = props.description || 'Описание этого участка парка пока недоступно.';
        let images = [];
        try {
          images = JSON.parse(props.images);
        } catch (err) {
        }

        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<strong>${title}`)
          .addTo(map);

        const exploreBtn = document.getElementById('explore-btn');
        exploreBtn.classList.add('disabled');
        exploreBtn.removeAttribute('href');

        const hname = document.getElementById('dynamic-title');
        const descElem = document.getElementById('dynamic-description');
        const imagesContainer = document.querySelector('.description-images');

        hname.classList.add('fade-out');
        descElem.classList.add('fade-out');
        imagesContainer.classList.add('fade-out');

        setTimeout(() => {
          hname.textContent = title;
          descElem.textContent = description;
          imagesContainer.innerHTML = '';
          images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = title;
            imagesContainer.appendChild(img);
          });

          hname.classList.remove('fade-out');
          descElem.classList.remove('fade-out');
          imagesContainer.classList.remove('fade-out');
        }, 300);
      });


    })
    .catch(err => console.error('Ошибка загрузки GeoJSON:', err));

});
