import { Controller } from 'stimulus';
import axios from 'axios';

export default class extends Controller {
  static targets = ["card"];

	show(event) {
    const y = event.y
    let position = 'above';
    if (y < 200) { position = 'below' }

    event.target.dataset.isHovering = true

    if (this.hasCardTarget) {
      this.cardTarget.classList.remove("hovercard-above");
      this.cardTarget.classList.remove("hovercard-below");
      this.cardTarget.classList.add(`hovercard-${position}`);
      this.cardTarget.classList.remove("hidden");
		} else {
      axios.get(this.url, { params: { position } })
        .then(res => {
          if (event.target.dataset.isHovering === 'true') {
            this.element.insertAdjacentHTML('beforeend', res.data);
          }
        })
        .catch(console.error)
    }
}
		
		hide(event) {
      event.target.dataset.isHovering = false

      if (this.hasCardTarget) {
        this.cardTarget.classList.add("hidden")
      }
		}

		disconnect() {
				if (this.hasCardTarget) { this.cardTarget.remove() }
		}

		get url() {
				return this.data.get('url')
		}
}
