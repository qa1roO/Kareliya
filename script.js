mapboxgl.accessToken = 'pk.eyJ1IjoicnVkeWJvcm1hbjk3IiwiYSI6ImNsMWhvNWk1djBsaG8zZXF1cW94OWNldmsifQ.oW8liYyNZtsGmUO4irSwoA';
// mapbox://styles/rudyborman97/cm8voxls800k701s9g4agaehk
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rudyborman97/cma12usrq00bi01qqbh5q1kpx',
  center: [33.245378488, 63.638475668],
  zoom: 5.03,
  interactive: false
});

let pois = [];
let nameToPoiIndex = {};
const actionLink = document.querySelector('.poi-action-link');
document.addEventListener('DOMContentLoaded', () => {
  fetch('map_1_description.json')
    .then(r => r.json())
    .then(data => {
      pois = data;
      pois.forEach((p, i) => {
        // возьмём первое слово из ключа
        const name0 = p.key.split(' ')[0];
        nameToPoiIndex[name0] = i;
      });
      const placeButtons = Array.from(document.querySelectorAll('.place-btn'));
      placeButtons.forEach(b => b.classList.remove('active'));

      // 1) после того как data загружены – показываем стартовые фото для первого района
      //    НО НЕ трогаем описание (updateDescription = false)
      initPoiCarousel(0, false);

      // 2) клики по кнопкам
      placeButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          placeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const titleEl = document.querySelector('.poi-title');
          titleEl.textContent = pois[idx].key;

          // при клике меняем и фото, и описание (updateDescription = true)
          initPoiCarousel(idx, true);
          const isSortavala = pois[idx].key.includes('Сортавальский');
          if (isSortavala) {
            actionLink.classList.remove('disabled');
          } else {
            actionLink.classList.add('disabled');
          }
        });
      });
    })
    .catch(console.error);
});



const slides = [
  {
    src: 'images/gallery/wallpaper1.jpg',
    title: 'Рускеальский экспресс'
  },
  {
    src: 'images/gallery/wallpaper2.jpg',
    title: 'Водопад Ахвенкоски'
  },
  {
    src: 'images/gallery/wallpaper3.jpg',
    title: 'Пяозеро'
  },
  {
    src: 'images/gallery/wallpaper4.jpg',
    title: 'Кижский погост'
  }
];


map.on('load', () => {
  
  // 1) добавляем источник
  map.addSource('karelia', {
    type: 'geojson',
    data: 'geojs/bound_karelia_mo.geojson'
  });
  
  // 2) создаём невидимый слой-заливку для отлова hover по карте
  map.addLayer({
    id:   'invisible-fill',
    type: 'fill',
    source: 'karelia',
    paint: {
      'fill-color': '#000',
      'fill-opacity': 0
    }
  });

  // 3) слой подсветки (заполняется только когда фильтр подставлен)
  map.addLayer({
    id:   'highlight-fill',
    type: 'fill',
    source: 'karelia',
    paint: {
      'fill-color': '#f00',
      'fill-opacity': 0.25
    },
    // по умолчанию ничего не показываем
    filter: ['==', ['get','osm_id'], '']
  });
  

  map.on('click', 'invisible-fill', e => {
    if (!e.features.length) return;
    // берём первое слово из свойства name
    const featureName0 = e.features[0].properties.name.split(' ')[0];
    const poiIndex     = nameToPoiIndex[featureName0];
    if (poiIndex == null) return;  // нет подходящего ПОИ — выходим
  
    // переключаем кнопки
    document.querySelectorAll('.place-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === poiIndex);
    });
    // обновляем заголовок
    document.querySelector('.poi-title').textContent = pois[poiIndex].key;
    // обновляем карусель и описание
    initPoiCarousel(poiIndex, true);
    const isSortavala = pois[poiIndex].key.includes('Сортавальский');
    if (isSortavala) {
      actionLink.classList.remove('disabled');
    } else {
      actionLink.classList.add('disabled');
    }
    // подсвечиваем полигон
    const osmId = e.features[0].properties.osm_id;
    map.setFilter('highlight-fill', ['==', ['get','osm_id'], osmId]);
  });

    // 4) hover на сам полигон (invisible-fill)
  map.on('mousemove', 'invisible-fill', e => {
    if (!e.features.length) return;
    const osmId = e.features[0].properties.osm_id;
    map.setFilter('highlight-fill',
      ['==', ['get','osm_id'], osmId]
    );
  });
  map.on('mouseleave', 'invisible-fill', () => {
    map.setFilter('highlight-fill', ['==', ['get','osm_id'], '']);
  });

  

  // 5) вручную навесим hover на кнопки
  fetch('geojs/bound_karelia_mo.geojson')
    .then(r => r.json())
    .then(fc => {
      const nameToId   = {};
      const idToButton = {};

      // строим nameToId
      fc.features.forEach(f => {
        const key = f.properties.name.split(' ')[0];
        nameToId[key] = f.properties.osm_id;
      });
      const sortavId = nameToId['Сортавальский'];
      if (sortavId != null) {
        map.addLayer({
          id:   'sortav-border',
          type: 'line',
          source: 'karelia',
          paint: {
            'line-color': '#00f',
            'line-width': 1
          },
          filter: ['==', ['get','osm_id'], sortavId]
        });
      }

      // навешиваем на кнопки и заполняем idToButton
      document.querySelectorAll('.place-btn').forEach(btn => {
        const key = btn.textContent.trim().split(' ')[0];
        const oid = nameToId[key];
        if (!oid) return;
        idToButton[oid] = btn;

        btn.addEventListener('mouseenter', () => {
          map.setFilter('highlight-fill', ['==', ['get','osm_id'], oid]);
        });
        btn.addEventListener('mouseleave', () => {
          map.setFilter('highlight-fill', ['==', ['get','osm_id'], '']);
        });
      });
      

      // теперь – hover по карте
      let prevId = null;
      map.on('mousemove', 'invisible-fill', e => {
        if (!e.features.length) return;
        const oid = e.features[0].properties.osm_id;

        // сброс предыдущей кнопки
        if (prevId && idToButton[prevId]) {
          idToButton[prevId].classList.remove('active');
        }

        // подсветка полигона
        map.setFilter('highlight-fill', ['==', ['get','osm_id'], oid]);

        // активируем текущую кнопку
        if (idToButton[oid]) {
          idToButton[oid].classList.add('active');
          prevId = oid;
        }
      });
      

      map.on('mouseleave', 'invisible-fill', () => {
        map.setFilter('highlight-fill', ['==', ['get','osm_id'], '']);
        if (prevId && idToButton[prevId]) {
          idToButton[prevId].classList.remove('active');
        }
        prevId = null;
      });
    });
});
(function(){
  let idx = 0;
  const imgEl   = document.querySelector('.gallery__img');
  const titleEl = document.querySelector('.gallery-caption__title');
  const prev    = document.querySelector('.gallery__nav--prev');
  const next    = document.querySelector('.gallery__nav--next');

  function show(i) {
    idx = (i + slides.length) % slides.length;
    // сначала плавно скрываем
    imgEl.style.opacity = 0;
    setTimeout(() => {
      // меняем картинку
      imgEl.src = slides[idx].src;
      // меняем подпись
      titleEl.textContent = slides[idx].title;
      // возвращаем видимость
      imgEl.style.opacity = 1;
    }, 250);
  }

  prev.addEventListener('click', () => show(idx - 1));
  next.addEventListener('click', () => show(idx + 1));

  // при загрузке сразу показываем первый слайд с подписью
  show(0);
})();

function initPoiCarousel(poiIndex, updateDescription = false) {
  let slideIndex = 0;
  const imgEl  = document.querySelector('.poi-img');
  const prev   = document.querySelector('.poi-nav--prev');
  const next   = document.querySelector('.poi-nav--next');
  const descEl = document.querySelector('.poi-desc');

  const poi = pois[poiIndex];
  // вычисляем папку: слово до первого пробела
  const folder = poi.key.split(' ')[0];

  function render() {
    if (updateDescription) {
      descEl.textContent = poi.description;
    }
    imgEl.style.opacity = 0;
    setTimeout(() => {
      console.log('Trying to load:', folder, poi.images[slideIndex]);
      imgEl.src = `images/map/${folder}/${poi.images[slideIndex]}`;
      imgEl.style.opacity = 1;
    }, 200);
  }

  prev.onclick = () => {
    slideIndex = (slideIndex - 1 + poi.images.length) % poi.images.length;
    render();
  };
  next.onclick = () => {
    slideIndex = (slideIndex + 1) % poi.images.length;
    render();
  };

  // показываем первый слайд
  render();
}

document.getElementById('id4').addEventListener('click', () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight, // полная высота страницы
    behavior: 'smooth'                          // плавный скролл
  });
});



// map.scrollZoom.disable();      // прокрутка колёсиком
// map.boxZoom.disable();         // зум рамкой
// map.dragRotate.disable();      // вращение правой кнопкой мыши
// map.dragPan.disable();         // перетаскивание карты
// map.keyboard.disable();        // клавиатурные стрелки и +/- 
// map.doubleClickZoom.disable(); // зум двойным щелчком
// map.touchZoomRotate.disable(); // жесты на тачскринах
