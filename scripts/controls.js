export function simulateClickEvent(documentName, path) {

  const file = flatTree.find(file => file.path.includes(documentName));

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
  renderMarkdown(event);
}
export function moveBack() {
  let leftArrow = document.getElementById('left-arrow-control');
  const target = leftArrow.getAttribute('data-target');
  if (target) {
    const documentName = target.split('/').pop().replace('.md', ''); // Extract document name
    simulateClickEvent(documentName, target);
  }
}

export function moveForward() {
  let rightArrow = document.getElementById('left-arrow-control');
  const target = rightArrow.getAttribute('data-target');
  if (target) {
    const documentName = target.split('/').pop().replace('.md', ''); // Extract document name
    simulateClickEvent(documentName, target);
  }
}

export function createControls(rootElement) {
  let leftArrow = document.createElement('span')
  let rightArrow = document.createElement('span')

  leftArrow.innerHTML = "&larr;"
  rightArrow.innerHTML = "&rarr;"

  leftArrow.id = "left-arrow-control";
  rightArrow.id = "right-arrow-control";

  leftArrow.title = "A lub ←";
  rightArrow.title = "D lub →";

  [leftArrow,rightArrow].forEach(arrow => arrow.classList.add('hidden'))

  leftArrow.addEventListener('click', moveBack)
  rightArrow.addEventListener('click', moveForward)

  document.addEventListener('keydown', (ev) => {
    let keyName = ev.key;
    if(keyName === "ArrowLeft" || keyName === "a") {
      moveBack()
    }
  })
  document.addEventListener('keydown', (ev) => {
    let keyName = ev.key;
    if(keyName === "ArrowRight" || keyName === "d") {
      moveForward()
    } 
  })

  rootElement.prepend(rightArrow)
  rootElement.prepend(leftArrow)
}

export function updateControlsIndexes(currentDocumentName) {
  if(!selectedTree) throw new Error("No tree structure selected");
  if(!flatTree) throw new Error("No flatten verions of a tree structure");
  
  let leftArrow = document.getElementById('left-arrow-control')
  let rightArrow = document.getElementById('right-arrow-control')

  let currentIndex = flatTree.findIndex(file => file.path.includes(currentDocumentName));



  leftArrow.classList.remove('hidden')
  rightArrow.classList.remove('hidden')

  if (currentIndex > 0) {
    leftArrow.setAttribute('data-target', flatTree[currentIndex - 1].path);
  } else {
    leftArrow.setAttribute('data-target', flatTree[flatTree.length - 1].path);
  }

  if (currentIndex < flatTree.length - 1) {
    rightArrow.setAttribute('data-target', flatTree[currentIndex + 1].path);
  } else {
    rightArrow.setAttribute('data-target', flatTree[0].path);
  }
}