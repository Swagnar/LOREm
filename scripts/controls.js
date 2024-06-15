/**
 * Creates relatively positioned arrow controls 
 * @param {HTMLDivElement} rootElement 
 * @param {CFlatTree} flatTree
 * @param {Function} renderFn
 */
export function createArrowControls(rootElement, flatTree, renderFn) {

  let leftArrow = document.createElement('span');
  let rightArrow = document.createElement('span');

  leftArrow.innerHTML = "&larr;";
  rightArrow.innerHTML = "&rarr;";

  leftArrow.id = "left-arrow-control";
  rightArrow.id = "right-arrow-control";

  leftArrow.title = "A lub ←";
  rightArrow.title = "D lub →";

  [leftArrow,rightArrow].forEach(arrow => arrow.classList.add('hidden', 'animate__animated'));

  rootElement.prepend(rightArrow);
  rootElement.prepend(leftArrow);
  addEventListenersToControls(leftArrow, rightArrow, renderFn, flatTree);
}
/**
 * Adds event listeners to the navigation controls and document for handling markdown rendering.
 * 
 * This function attaches 'click' event listeners to the left and right arrow controls to render
 * the previous or next markdown content respectively. It also attaches a 'keydown' event listener
 * to the document to handle navigation using arrow keys or 'a'/'d' keys for similar functionality.
 *
 * @param {HTMLElement} leftArrow - The HTML element representing the left arrow control.
 * @param {HTMLElement} rightArrow - The HTML element representing the right arrow control.
 * @param {Function} renderFn - The function to render the markdown content.
 * @param {Array} flatTree - The array representing the structure of the markdown content.
 */
function addEventListenersToControls(leftArrow, rightArrow, renderFn, flatTree) {

  /**
   * Animates the arrow element and invokes the rendering function.
   * 
   * @param {HTMLElement} arrow - The arrow element to animate.
   * @param {Function} moveFn - The function to move to the previous or next markdown content.
   */
  function animateAndMove(arrow, moveFn) {
    arrow.classList.add('animate__headShake');
    setTimeout(() => {
      arrow.classList.remove('animate__headShake');
    }, 1000);

    renderFn(moveFn(arrow, flatTree));
  }

  /**
   * Checks if the currently focused element is an input or textarea.
   * 
   * @returns {boolean} - True if an input or textarea element is focused, false otherwise.
   */
  function isInputFocues() {
    const activeElement = document.activeElement;
    return activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' );
  }

  try {

    // Add 'click' event to arrow controls
    leftArrow.addEventListener('click', function() {
      animateAndMove(leftArrow, moveBack);
    });
    rightArrow.addEventListener('click', function() { 
      animateAndMove(rightArrow, moveForward);
    });
  
    // Keydown listener
    // If there is any active input element, abort listening
    document.addEventListener('keydown', (ev) => {
      if (isInputFocues()) return;
      if(ev.key === "ArrowLeft" || ev.key === "a") {
        animateAndMove(leftArrow, moveBack);
      }
      if(ev.key === "ArrowRight" || ev.key === "d") {
        animateAndMove(rightArrow, moveForward);
      } 
    });
    
  } catch(er) {
    console.error(er);
  } 
}
/**
 * 
 * @param {HTMLDivElement} rootElement 
 * @param {CFlatTree} flatTree 
 * @param {Function} renderFn 
 */
export function createSearchMenu(rootElement, flatTree, renderFn) {
  if(!flatTree) {
    throw new TypeError('Cannot create datalist element, flatTree is undefined');
  }
  let searchWrapper = document.createElement('search');

  let searchInput = document.createElement('input');
  let searchButton = document.createElement('button');
  let searchDataList = document.createElement('datalist');

  searchDataList.id = "search-datalist";
  searchInput.setAttribute('list', 'search-datalist');
  searchInput.placeholder = "Wpisz nazwę pliku...";
  searchInput.id = "search-input";

  searchButton.innerText = "Szukaj";

  flatTree.files.forEach(file => {
    let option = document.createElement('option');
    option.value = file.name;
    option.dataset.path = file.relativePath;

    searchDataList.append(option);
  });

  searchWrapper.append(searchInput, searchButton, searchDataList);

  rootElement.append(searchWrapper);

  searchWrapper.classList.add('animate__animated', 'animate__fadeIn');

  addEventListenersToSearchMenu(searchInput, searchButton, flatTree, renderFn)
}
/**
 * Adds event listeners to the search menu input and submit elements.
 * 
 * This function attaches a 'keydown' event listener to the input element to detect the 'Enter' key press,
 * and a 'click' event listener to the submit element to handle the search functionality.
 *
 * @param {HTMLElement} inputElement - The HTML input element for entering search terms.
 * @param {HTMLElement} submitElement - The HTML element to trigger the search action.
 * @param {Array} flatTree - The array representing the structure of the markdown content.
 * @param {Function} renderFn - The function to render the markdown content based on the search result.
 */
function addEventListenersToSearchMenu(inputElement, submitElement, flatTree, renderFn) {
  /**
   * Event listener for the 'keydown' event on the input element.
   * Triggers the click event on the submit element when the 'Enter' key is pressed.
   *
   * @param {KeyboardEvent} ev - The keyboard event.
   */
  inputElement.addEventListener('keydown', (ev) => {
    if(ev.key === 'Enter') {
      submitElement.click();
    }
  });
  
  /**
   * Event listener for the 'click' event on the submit element.
   * Finds the file in the flatTree matching the input value and triggers the render function.
   */
  submitElement.addEventListener('click', function() {
    let file = flatTree.getFileByName(inputElement.value);

    let ev = simulateClickEvent(file.name, flatTree);
    renderFn(ev);
    console.log(file);
  });
}



/**
 * 
 * @param {string} documentName Name of the file that's to be fetched
 * @param {string} relativePath Relative path of the file
 * @param {*} flatTree 
 * @returns 
 */
function simulateClickEvent(documentName, flatTree) {

  const file = flatTree.getFileByName(documentName);

  if (!file) {
    console.error('Document not found:', documentName);
    return;
  }

  const event = new CustomEvent('mock', {
    detail: {
      path: file.relativePath,
      documentName: file.name
    }
  });
  return event;
}
/**
 * 
 * @param {HTMLSpanElement} leftArrow 
 * @param {Object[]} flatTree 
 * @returns {CustomEvent}
 */
function moveBack(leftArrow, flatTree) {
  if(!leftArrow || !flatTree) throw new TypeError(`Expected HTMLSpan and Object[], got ${typeof leftArrow} and ${typeof flatTree}:`);
  
  const target = leftArrow.getAttribute('data-path');
  
  if (target) {
    const documentName = target.split('/').pop().replace('.md', ''); // Extract document name
    return simulateClickEvent(documentName, flatTree);
  } else {
    throw new TypeError("Couldn't find the elements data");
  }
}
/**
 * 
 * @param {HTMLSpanElement} rightArrow 
 * @param {Object[]} flatTree 
 * @returns {CustomEvent}
 */
function moveForward(rightArrow, flatTree) {
  if(!rightArrow || !flatTree) throw new TypeError(`Expected HTMLSpan and CFlatTree, got ${typeof rightArrow} and ${typeof flatTree}:`);
  
  const target = rightArrow.getAttribute('data-path');
  
  if (target) {
    const documentName = target.split('/').pop().replace('.md', ''); // Extract document name
    return simulateClickEvent(documentName, flatTree);
  } else {
    throw new TypeError("Couldn't find the elements data");
  }
}