/**
 * CHÉZ GRAY — Calendar Renderer
 * Reads BOOKED_RANGES from dates.js and renders
 * an interactive monthly availability calendar.
 */

(function () {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function isBooked(date) {
    if (!window.BOOKED_RANGES) return false;
    return BOOKED_RANGES.some(range => {
      const s = parseDate(range.start);
      const e = parseDate(range.end);
      return date >= s && date <= e;
    });
  }

  function renderCalendar() {
    const grid = document.getElementById('calGrid');
    const label = document.getElementById('calMonthLabel');
    if (!grid || !label) return;

    label.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    grid.innerHTML = '';

    // Day name headers
    DAYS.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-day-name';
      el.textContent = d;
      grid.appendChild(el);
    });

    // First day offset
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      grid.appendChild(el);
    }

    // Days of the month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const el = document.createElement('div');
      el.className = 'cal-day';
      el.textContent = d;

      if (date < today) {
        el.classList.add('past');
      } else if (isBooked(date)) {
        el.classList.add('booked');
        el.title = 'Booked';
      } else {
        el.classList.add('available');
      }

      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        el.classList.add('today');
      }

      grid.appendChild(el);
    }
  }

  window.changeMonth = function (delta) {
    viewMonth += delta;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  };

  // Set default date inputs to today / tomorrow
  window.addEventListener('DOMContentLoaded', () => {
    const checkin = document.getElementById('fcheckin');
    const checkout = document.getElementById('fcheckout');
    if (checkin && checkout) {
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      checkin.min = todayStr;
      checkout.min = tomorrowStr;
      checkin.addEventListener('change', () => {
        checkout.min = checkin.value;
        if (checkout.value && checkout.value <= checkin.value) {
          const d = new Date(checkin.value);
          d.setDate(d.getDate() + 1);
          checkout.value = d.toISOString().split('T')[0];
        }
      });
    }
    renderCalendar();
  });
})();
