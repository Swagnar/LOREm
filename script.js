import { applyParallax, flattenTree } from "./scripts/utils.js";
import { moveBack, moveForward } from "./scripts/controls.js";
import { DND_TREE } from "./scripts/DND.js";
import { TWD_TREE } from "./scripts/TWD.js";

const ROOT = document.getElementById('root');

/**
 * @type {string}
 */
var selectedView = "";

/**
 * @type 
 */
var selectedTree;

var flatTree;


function clearRootElement() {
  ROOT.innerHTML = '';
  ROOT.classList.remove('fullwidth') 
}

/**
 * 
 * @param {Event|CustomEvent} e - event when clicking on a documents name in the navbar, or `CustomEvent` from arrow controls
 * 
 * Function fetches the documents contents based on `innerHTML` of the navbar dropdown menu element that was clicked.
 * It also adds `EventListener` to all `<a>` tags inside markdown, that have `data-path` attribiute
 *
 */
function renderMarkdown(e) {
  console.log("Rendering markdown with event: ", e.type)
  try {
    var path;
    var documentName;

    // Get info about the document whitch name has been clicked in the navbar (or mocked)
    if(e.type == 'mock') {
      path = selectedView + "/" + e.detail.path;
      documentName = e.detail?.documentName;
    } else {
      path = selectedView + "/" + e.target.dataset.path;
      documentName = e.target.innerHTML;
    }
    
    
    // Guard clauses
    if(!path) throw new Error("Selected nav link does not containt path dataset")
    if(!documentName) throw new Error("Selected nav link does not have a text? How did you click it???")
    

    fetch(path)
      .then(response => response.text())
      .then(markdown => {
        
        // Parse the fetched file contents as markdown and inject it inside `#content` element
        document.getElementById('content').innerHTML = marked.parse(markdown);
        
        // Change the pages title
        document.title = "LOREm | " + documentName;
        
        console.log("Markdown successfully rendered, adding event listeners to anchors");
        
        // Add event listener to all <a data-path=""> tags in a given .md document
        document.querySelectorAll('a[data-path]').forEach(a => {
          a.addEventListener('click', renderMarkdown)
        })

        // View has changed, new document rendered. Update attribiute indexes for controls and their event handelers
        updateControlsIndexes(documentName)
      })
      .catch(error => console.error('Error while rendering markdown:', error));

  } catch(er) {
    console.error(er);
  }
}

function createNavbar() {
  console.log("Creating navbar...")

  const navbar = document.createElement('nav');
  
  try {
    if(!selectedTree) throw new TypeError(`No tree structure selected, got ${typeof selectedTree} expected Object` );

    selectedTree.forEach(dir => {

      if(!dir.name) throw new TypeError(`No direcory name found, got ${typeof dir.name} expected string`);

      let navDropdownButtonWrapper = document.createElement('div');
      let navDropdownButtonNameElement = document.createElement('span');

      navDropdownButtonNameElement.innerText = dir.name;

      navDropdownButtonWrapper.classList.add('dropdown');
      navDropdownButtonNameElement.classList.add('dropbtn');
      
      navDropdownButtonWrapper.append(navDropdownButtonNameElement);

      if(!dir.files) {
        throw new Error(`Directory ${dir.name} does not have any files`);
      }
      let navDropdownContentWrapper = document.createElement('div');
      navDropdownContentWrapper.classList.add('dropdown-content');
      dir.files.forEach(file => {

        // TODO
        //
        // If there is a directory inside `dir`, display it as a opt group or smth like that
        //
        
        let navDropdownContentElement = document.createElement('span');
        navDropdownContentElement.innerText = file.name;
        navDropdownContentElement.dataset.path = file.relativePath;
        
        // When the menu element is clicked, handle it by fetching and rendering its markdown contents
        navDropdownContentElement.addEventListener('click', renderMarkdown);
        
        // Appending the file that is inside a given directory to its hoverable parent element
        navDropdownContentWrapper.append(navDropdownContentElement);

      });

      navDropdownButtonWrapper.append(navDropdownContentWrapper);
      navbar.append(navDropdownButtonWrapper);
      console.log("Navbar created")
    });
    ROOT.append(navbar);
  } catch(e) {
    console.error(e);
  }
}

/**
 * Creates relatively positioned arrow controls 
 * @param {HTMLDivElement} rootElement 
 */
function createControls(rootElement) {

  let leftArrow = document.createElement('span')
  let rightArrow = document.createElement('span')

  leftArrow.innerHTML = "&larr;"
  rightArrow.innerHTML = "&rarr;"

  leftArrow.id = "left-arrow-control";
  rightArrow.id = "right-arrow-control";

  leftArrow.title = "A lub ←";
  rightArrow.title = "D lub →";

  [leftArrow,rightArrow].forEach(arrow => arrow.classList.add('hidden'))

  try {

    // Add 'click' event to arrow controls
    leftArrow.addEventListener('click', function() { renderMarkdown(moveBack(leftArrow, flatTree)) })
    rightArrow.addEventListener('click', function() { renderMarkdown(moveForward(rightArrow,flatTree)) })
  
    // Add 'keydown' event listener for the `document`, check if the keys are navigational and then behave like `click` event
    document.addEventListener('keydown', (ev) => {
      let keyName = ev.key;
      if(keyName === "ArrowLeft" || keyName === "a") {
        renderMarkdown(moveBack(leftArrow, flatTree))
      }
    })
    document.addEventListener('keydown', (ev) => {
      let keyName = ev.key;
      if(keyName === "ArrowRight" || keyName === "d") {
        renderMarkdown(moveForward(rightArrow, flatTree))
      } 
    })

  } catch(er) {
    console.error(er)
  } finally {
    rootElement.prepend(rightArrow)
    rootElement.prepend(leftArrow)
  }
}

function updateControlsIndexes(currentDocumentName) {
  if(!selectedTree) throw new Error("No tree structure selected");
  if(!flatTree) throw new Error("No flatten verions of a tree structure");
  
  let leftArrow = document.getElementById('left-arrow-control')
  let rightArrow = document.getElementById('right-arrow-control')

  let currentIndex = flatTree.findIndex(file => file.path.includes(currentDocumentName));

  leftArrow.classList.remove('hidden')
  rightArrow.classList.remove('hidden')

  switch (currentIndex) {
    case 0:
      leftArrow.setAttribute('data-path', flatTree[flatTree.length-1].path);
      break;
    case flatTree.length-1:
      rightArrow.setAttribute('data-path', flatTree[0].path);
      break;
    default:
      leftArrow.setAttribute('data-path', flatTree[currentIndex-1].path);
      rightArrow.setAttribute('data-path', flatTree[currentIndex+1].path);
  }
}

/**
 * During boot screen, handle clicking on either campaign
 * Clear the root tag, create <nav> navbar, <div id="content"> for markdown
 * Create left and right arrows controls
 */
function changeView() {
  try {
    if(!selectedView) {
      throw new Error("No selected view, `selectedView` value = " + `${selectedView}`);
    }
    clearRootElement();
    createNavbar();
    
    const contentElement = document.createElement('div');
    contentElement.id = "content";
    ROOT.append(contentElement); 


    createControls(ROOT)

  } catch(er) {
    console.error(er)
  }
}

function createBootScreen(rootElement) {
  rootElement.classList.add('fullwidth')

  let bootScreenWrapper = document.createElement('div');
  
  let bootScreenDNDWrapper = document.createElement('div');
  let bootScreenTWDWrapper = document.createElement('div');

  let backgroundDND = document.createElement('div');
  let backgroundTWD = document.createElement('div');

  let logoDND = document.createElement('img');
  let logoTWD = document.createElement('img');

  logoDND.src = 'media/dnd_logo.png';
  logoTWD.src = 'media/twd_logo.png';


  bootScreenWrapper.classList.add('boot-screen-wrapper');
  bootScreenDNDWrapper.classList.add('boot-screen-part', 'left-side');
  bootScreenTWDWrapper.classList.add('boot-screen-part', 'right-side');

  backgroundDND.classList.add('boot-screen-dnd', 'boot-screen-background');
  backgroundTWD.classList.add('boot-screen-twd', 'boot-screen-background');

  logoDND.classList.add('boot-screen-logo');
  logoTWD.classList.add('boot-screen-logo');

  [bootScreenDNDWrapper, bootScreenTWDWrapper].forEach(wrapper => {
    wrapper.addEventListener('mousemove', (e) => applyParallax(e, wrapper));
  });

  bootScreenDNDWrapper.addEventListener('mouseenter', () => {
    bootScreenTWDWrapper.classList.add('gray-out');
  });
  bootScreenTWDWrapper.addEventListener('mouseenter', () => {
    bootScreenDNDWrapper.classList.add('gray-out');
  });
  bootScreenDNDWrapper.addEventListener('mouseleave', () => {
    bootScreenTWDWrapper.classList.remove('gray-out');
  });
  bootScreenTWDWrapper.addEventListener('mouseleave', () => {
    bootScreenDNDWrapper.classList.remove('gray-out');
  });

  logoDND.addEventListener('click', () => {
    selectedView = "DND";
    selectedTree = DND_TREE;
    console.log(selectedTree)
    flatTree = flattenTree(DND_TREE);
    changeView();
  });

  logoTWD.addEventListener('click', () => {
    selectedView = "TWD";
    selectedTree = TWD_TREE;
    flatTree = flattenTree(TWD_TREE);
    changeView();
  });

  bootScreenDNDWrapper.append(backgroundDND, logoDND);
  bootScreenTWDWrapper.append(backgroundTWD, logoTWD);
  bootScreenWrapper.append(bootScreenDNDWrapper, bootScreenTWDWrapper);
  rootElement.append(bootScreenWrapper);
}

window.onload = () => {

  createBootScreen(ROOT);
};

