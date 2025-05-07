mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rudyborman97/cm8voxls800k701s9g4agaehk',
    center: [30.587858, 61.775442],
    zoom: 8
});

document.querySelector('.point').addEventListener('click', () => {
    const legend = document.getElementById('legend-panel');
    legend.classList.toggle('active');
  });
  
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
      el.style.width  = '45px';
      el.style.height = '45px';
      el.style.backgroundImage = `url(${m.image})`;
      el.style.backgroundSize  = 'contain';

      new mapboxgl.Marker(el)
        .setLngLat(m.coordinates)
        .addTo(map);
      


        el.addEventListener('mouseenter', () => {
            // Увеличиваем размер
            el.style.width = '80px';
            el.style.height = '80px';
            el.style.zIndex = '1000'; // чтобы маркер был над другими
            popup.setLngLat(m.coordinates).addTo(map);
          });
          
          el.addEventListener('mouseleave', () => {
            // Возвращаем исходный размер
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

      // 3) hover: показываем/скрываем pop-up
      el.addEventListener('mouseenter', () => popup.setLngLat(m.coordinates).addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());

      // 4) click: меняем текст второго <p> на описание из JSON
      el.addEventListener('click', () => {
        const descElem = document.getElementById('dynamic-description');
        const imagesContainer = document.querySelector('.description-images');
      
        // 1) Запускаем затухание
        descElem.classList.add('fade-out');
        imagesContainer.classList.add('fade-out');
      
        // 2) Когда затухание закончится (300ms), меняем контент и «выводим»
        setTimeout(() => {
          // Обновляем текст
          descElem.textContent = m.description;
      
          // Обновляем картинки
          imagesContainer.innerHTML = '';
          if (Array.isArray(m.images)) {
            m.images.forEach(src => {
              const img = document.createElement('img');
              img.src = src;
              img.alt = m.title;
              imagesContainer.appendChild(img);
            });
          }
      
          // Убираем класс fade-out → элементы плавно появятся
          descElem.classList.remove('fade-out');
          imagesContainer.classList.remove('fade-out');
        }, 300); // совпадает с длительностью transition
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
          'fill-color': '#088', // цвет полигона
          'fill-opacity': 0.4
        }
      });

      map.addLayer({
        id: 'ladoga-park-highlight',
        type: 'fill',
        source: 'ladoga-park',
        paint: {
          'fill-color': '#0ff',
          'fill-opacity': 0.6
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
        const coordinates = e.lngLat;
        const title = e.features[0].properties.name || 'Ладожский парк';
      
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<strong>${title}</strong>`)
          .addTo(map);
      });
         
    })
    .catch(err => console.error('Ошибка загрузки GeoJSON:', err));
});

