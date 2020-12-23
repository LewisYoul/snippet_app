import { Controller } from 'stimulus';
import axios from 'axios';

export default class extends Controller {
  static targets = ["moveButton", "listItem", "errors"];


  initialize() {
    const csrfToken = document.querySelector("meta[name=csrf-token]").content
    axios.defaults.headers.common['X-CSRF-Token'] = csrfToken
  }
  
  connect() {
    if (this.hasMoveButtonTarget) {
      this.moveButtonTarget.disabled = true
    }
  }

  update(event) {
    const element = document.getElementById(event.detail.client_id)

    if (element) { element.outerHTML = event.detail.element }
  }

  onCreateSuccess(event) {
    const [data, status, xhr] = event.detail;
    const createEvent = new CustomEvent('snippet-created', { detail: data })
    window.dispatchEvent(createEvent)

    this.toast.display('Your snippet was created!')
    this.emitModalClose();
  }

  onCreateError(event) {
    const [data, status, xhr] = event.detail;
    this.errorsTarget.innerHTML = data.element;
  }

  onUpdateSuccess(event) {
    const [data, status, xhr] = event.detail;
    const updateEvent = new CustomEvent('snippet-updated', { detail: data })
    window.dispatchEvent(updateEvent)

    this.toast.display('Your snippet was updated!')
    this.emitModalClose();
  }

  onUpdateError(event) {
    const [data, status, xhr] = event.detail;
    this.errorsTarget.innerHTML = data.element;
  }

  view_snippet(event) {
    event.stopPropagation()
    const snippetUrl = event.currentTarget.dataset.snippetUrl

    // event is still propagating when using visit
    // Turbolinks.visit(snippetUrl)
    window.location.href = snippetUrl
  }

  modal_search(event) {
    const searchTerm = event.target.value.toLowerCase();

    this.listItemTargets.forEach(item => {
      const folderName = item.getAttribute('data-filter-key').toLowerCase()

      if (folderName.includes(searchTerm)) {
        item.classList.remove('hidden')
      } else {
        item.classList.add('hidden')
      }
    })
  }
  
  select_folder(event) {
    const folderId = event.target.dataset.folderId
    
    if (folderId === this.selectedFolderId ) { return }
    
    const previousSelection = this.element.getElementsByClassName('move-snippet--item-selected')[0]

    if (previousSelection) {
      previousSelection.classList.remove('move-snippet--item-selected')
      previousSelection.classList.add('move-snippet--item')
      const checkmark = document.getElementById('selected-checkmark')
      const checkmarkClone = checkmark.cloneNode(true)
      
      checkmark.remove()
      
      event.target.insertAdjacentElement("beforeend", checkmarkClone)
    } else {
      event.target.insertAdjacentHTML('beforeend', '<img id="selected-checkmark" src="/icons/checked.svg" width="14">')
    }
    
    event.target.classList.add('move-snippet--item-selected')
    
    this.selectedFolderId = folderId

    if (this.selectedFolderId === this.originalFolderId) {
      this.moveButtonTarget.disabled = true
      this.moveButtonTarget.classList.remove('button--cta-new')
      this.moveButtonTarget.classList.add('button--cta-disabled')
    } else {
      this.moveButtonTarget.disabled = false
      this.moveButtonTarget.classList.remove('button--cta-disabled')
      this.moveButtonTarget.classList.add('button--cta-new')
    }
  }

  file() {
    axios.post(this.confirmPath, { folder_id: this.selectedFolderId }, { headers: { 'accept': 'application/json' } })
      .then(res => {
        this.toast.display(res.data.message)
        this.emitModalClose();
      })
      .catch(error => {
        console.error(error)
        this.toast.display('Unable to file snippet')
      })
  }

  emitModalClose() {
    const event = new CustomEvent('close-modal')
    window.dispatchEvent(event)
  }

  get url() {
    return this.data.get('url')
  }

  get selectedFolderId() {
    return this.data.get('selectedFolderId')
  }

  get originalFolderId() {
    return this.data.get('originalFolderId')
  }

  get modal() {
    return document.getElementById('modal').modal
  }

  get toast() {
    return document.getElementById('toast').toast
  }

  get confirmPath() {
    return this.data.get('confirmPath')
  }

  set confirmPath(newPath) {
    return this.data.set('confirmPath', newPath)
  }

  set selectedFolderId(folderId) {
    return this.data.set('selectedFolderId', folderId)
  }

  get modal() {
    return document.getElementById('modal').modal
  }
}
