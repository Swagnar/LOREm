/**
 * Creates relatively positioned arrow controls 
 * @param {HTMLDivElement} rootElement 
 */
export function createArrowControls(rootElement, renderFn, flatTree) {

  let leftArrow = document.createElement('span');
  let rightArrow = document.createElement('span');

  leftArrow.innerHTML = "&larr;";
  rightArrow.innerHTML = "&rarr;";

  leftArrow.id = "left-arrow-control";
  rightArrow.id = "right-arrow-control";

  leftArrow.title = "A lub ←";
  rightArrow.title = "D lub →";

  [leftArrow,rightArrow].forEach(arrow => arrow.classList.add('hidden'));

  rootElement.prepend(rightArrow);
  rootElement.prepend(leftArrow);
  addEventListenersToControls(leftArrow, rightArrow, renderFn, flatTree);
  return [leftArrow, rightArrow];
}

export function createSearchMenu(rootElement, flatTree) {
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

  flatTree.forEach(element => {
    let option = document.createElement('option');
    option.value = element.name;
    option.dataset.path = element.relativePath;

    searchDataList.append(option);
  });

  searchWrapper.append(searchInput, searchButton, searchDataList);

  rootElement.append(searchWrapper);

  return [searchInput, searchButton];
}
/**
 * Adds event listeners to the navigation controls and document for handling markdown rendering.
 * 
 * This function attaches 'click' event listeners to the left and right arrow controls to render
 * the previous or next markdown content respectively. It also attaches 'keydown' event listeners
 * to the document to handle navigation using arrow keys or 'a'/'d' keys for similar functionality.
 *
 * @param {HTMLElement} leftArrow - The HTML element representing the left arrow control.
 * @param {HTMLElement} rightArrow - The HTML element representing the right arrow control.
 */
function addEventListenersToControls(leftArrow, rightArrow, renderFn, flatTree) {

  function isInputFocues() {
    const activeElement = document.activeElement;
    return activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' );
  }

  try {

    // Add 'click' event to arrow controls
    leftArrow.addEventListener('click', function() { renderFn(moveBack(leftArrow, flatTree)); });
    rightArrow.addEventListener('click', function() { renderFn(moveForward(rightArrow,flatTree)); });
  
    // Keydown listeners
    // If there is any active input element, abort listening
    document.addEventListener('keydown', (ev) => {
      if (isInputFocues()) return;
      if(ev.key === "ArrowLeft" || ev.key === "a") {
        renderFn(moveBack(leftArrow, flatTree));
      }
    });
    document.addEventListener('keydown', (ev) => {
      if (isInputFocues()) return;
      if(ev.key === "ArrowRight" || ev.key === "d") {
        renderFn(moveForward(rightArrow, flatTree));
      } 
    });
  } catch(er) {
    console.error(er);
  } 
}
export function addEventListenersToSearchMenu(inputElement, submitElement, flatTree, renderFn) {
  inputElement.addEventListener('keydown', (ev) => {
    if(ev.key === 'Enter') {
      submitElement.click();
    }
  });
  
  submitElement.addEventListener('click', function() {
    let file = flatTree.find(f => f.name.includes(inputElement.value));

    let ev = simulateClickEvent(file.name, file.path, flatTree);
    renderFn(ev);
    console.log(file);
  });
}

function simulateClickEvent(documentName, path, flattenTree) {

  const file = flattenTree.find(file => file.path.includes(documentName));

  if (!file) {
    console.error('Document not found:', documentName);
    return;
  }

  const event = new CustomEvent('mock', {
    detail: {
      path: path,
      documentName: documentName
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
export function moveBack(leftArrow, flatTree) {
  if(!leftArrow || !flatTree) throw new TypeError(`Expected HTMLSpan and Object[], got ${typeof leftArrow} and ${typeof flatTree}:`)
  
  const target = leftArrow.getAttribute('data-path');
  
  if (target) {
    const documentName = target.split('/').pop().replace('.md', ''); // Extract document name
    return simulateClickEvent(documentName, target, flatTree);
  } else {
    throw new TypeError("Couldn't find the elements data")
  }
}
/**
 * 
 * @param {HTMLSpanElement} rightArrow 
 * @param {Object[]} flatTree 
 * @returns {CustomEvent}
 */
export function moveForward(rightArrow, flatTree) {
  if(!rightArrow || !flatTree) throw new TypeError(`Expected HTMLSpan and Object[], got ${typeof rightArrow} and ${typeof flatTree}:`)
  
  const target = rightArrow.getAttribute('data-path');
  
  if (target) {
    const documentName = target.split('/').pop().replace('.md', ''); // Extract document name
    return simulateClickEvent(documentName, target, flatTree);
  } else {
    throw new TypeError("Couldn't find the elements data")
  }
}