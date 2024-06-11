/**
 * Creates relatively positioned arrow controls 
 * @param {HTMLDivElement} rootElement 
 */
export function createArrowControls(rootElement) {

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