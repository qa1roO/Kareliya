let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();

// 2) Ссылки на правый блок
const subtitleEl = document.getElementById('event-subtitle');
const descEl      = document.getElementById('event-description');
const img1El      = document.getElementById('event-img1');
const img2El      = document.getElementById('event-img2');

const dayListEl   = document.querySelector(".calendar-dates");
const currdateEl  = document.querySelector(".calendar-current-date");
const prenexIcons = document.querySelectorAll(".calendar-navigation span");

// Array of month names
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// 1) Сначала загрузим все события
let eventsData = {};
fetch('events.json')
  .then(res => res.json())
  .then(data => {
    eventsData = data;
    renderCalendar();     // после загрузки данных рендерим календарь
  })
  .catch(err => {
    console.error('Не удалось загрузить events.json:', err);
    renderCalendar();     // даже если нет данных, показываем календарь
  });

// Функция генерации календаря
function manipulate() {
  const dayone     = new Date(year, month, 1).getDay();
  const lastdate   = new Date(year, month + 1, 0).getDate();
  const dayend     = new Date(year, month, lastdate).getDay();
  const prevLast   = new Date(year, month, 0).getDate();
  let lit = "";

  // предыдущий месяц
  for (let i = dayone; i > 0; i--) {
    lit += `<li class="inactive">${prevLast - i + 1}</li>`;
  }

  // текущий месяц
  for (let i = 1; i <= lastdate; i++) {
    // Формируем ключ YYYY-MM-DD
    const day   = String(i).padStart(2, '0');
    const mon   = String(month + 1).padStart(2, '0');
    const key   = `${year}-${mon}-${day}`;
    const isToday = 
      i === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    // Проверяем, есть ли событие на эту дату
    const hasEvent = eventsData[key] ? 'has-event' : '';

    // класс active для сегодняшнего дня
    const cls = isToday ? 'active ' : '';
    lit += `<li class="${cls}${hasEvent}">${i}</li>`;
  }

  // следующий месяц
  for (let i = dayend; i < 6; i++) {
    lit += `<li class="inactive">${i - dayend + 1}</li>`;
  }

  currdateEl.innerText = `${months[month]} ${year}`;
  dayListEl.innerHTML  = lit;
}

// Навешиваем клики на даты
function attachDateListeners() {
  document.querySelectorAll('.calendar-dates li').forEach(li => {
    if (li.classList.contains('inactive')) return;

    li.addEventListener('click', () => {
      const d  = li.textContent.padStart(2, '0');
      const m  = String(month + 1).padStart(2, '0');
      const key = `${year}-${m}-${d}`;
      const ev  = eventsData[key];

      if (ev) {
        subtitleEl.textContent      = ev.title;
        descEl.textContent          = ev.description;
        img1El.src                  = ev.images[0] || img1El.src;
        img2El.src                  = ev.images[1] || img2El.src;
      } else {
        subtitleEl.textContent = "Событий на данную дату нет";
      }

      // сброс active и подсветка выбранной
      document.querySelectorAll('.calendar-dates li.active')
        .forEach(el => el.classList.remove('active'));
      li.classList.add('active');
    });
  });
}

function renderCalendar() {
  manipulate();
  attachDateListeners();
}

// Навигация по месяцам
prenexIcons.forEach(icon => {
  icon.addEventListener("click", () => {
    month += icon.id === "calendar-prev" ? -1 : 1;
    if (month < 0 || month > 11) {
      date = new Date(year, month, date.getDate());
      year = date.getFullYear();
      month = date.getMonth();
    }
    renderCalendar();
  });
});
