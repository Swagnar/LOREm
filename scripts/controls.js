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