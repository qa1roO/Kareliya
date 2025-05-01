mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rudyborman97/cm8voxls800k701s9g4agaehk',
    center: [30.587858, 61.775442],
    zoom: 8
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
      el.style.width  = '40px';
      el.style.height = '40px';
      el.style.backgroundImage = `url(${m.image})`;
      el.style.backgroundSize  = 'contain';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(m.coordinates)
        .addTo(map);
      
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

// (необязательно) навигационные контролы
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
