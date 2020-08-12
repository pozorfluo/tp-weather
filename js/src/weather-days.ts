class WeatherDays extends HTMLElement{
  constructor() {
    super();

    const button = document.createElement('a');
    button.classList.add('day-button');
    button.textContent = 'Now';

    this.appendChild(button);

      //   const day = new Date(f.daily[i].timestamp * 1000);
      //   const day_button = button.cloneNode(true);
      //   day_button.textContent = day.toLocaleDateString(navigator.language, {
      //     weekday: 'long',
      //   });
      //   day_button.addEventListener('click', (e) => {
      //     app.pins.day.set(i);
      //     e.preventDefault();
      //   });
      //   fragment.appendChild(day_button);
  }
}


customElements.define('weather-days', WeatherDays);