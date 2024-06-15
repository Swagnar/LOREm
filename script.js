import { createBootScreen, createNavbar } from "./scripts/utils.js";
import { createArrowControls, createSearchMenu } from "./scripts/controls.js";

import { CTree, CFlatTree } from "./scripts/classes/Tree.class.js";

import { DND_TREE } from "./scripts/DND.js";
import { TWD_TREE } from "./scripts/TWD.js";

const ROOT = document.getElementById('root');

/**
 * @type {string} - Holds the string representation of the selected view. 
 *                  Only acceptable options are: `"TWD"` and `"DND"`
 */
var selectedView = "";

/**
 * @type {CTree} - Holds the main tree structure of the selected view. 
 */
var selectedTree;

/**
 * @type {CFlatTree} - Holds the flattened version of the tree structure. 
 */
var flatTree;


/**
 * Function clears the root element and plays the zoomOut animation when selecting the scenario
 */
async function clearRootElement() {
  function animateBootScreen() {
    return new Promise((resolve) => {
      ROOT.classList.add('animate__animated', 'animate__zoomOut');
      ROOT.addEventListener('animationend', resolve, { once: true });
    });
  }

  await animateBootScreen();
  ROOT.innerHTML = '';
  ROOT.classList.remove('fullwidth', 'animate__animated', 'animate__zoomOut');
}

/**
 * Renders the markdown content of a document based on an event.
 * 
 * This function fetches the content of a markdown document based on the `innerHTML` of the navbar
 * dropdown menu element that was clicked, or based on details from a `CustomEvent` triggered by 
 * arrow controls. It parses the markdown content and injects it into the `#content` element.
 * Additionally, it adds `click` event listeners to all `<a>` tags with a `data-path` attribute
 * inside the rendered markdown.
 *
 * @param {Event|CustomEvent} e - The event triggered by clicking on a document's name in the 
 *                                navbar, or a `CustomEvent` from arrow controls.
 * @throws {Error} Throws an error if the selected nav link does not contain a path dataset or 
 *                if the document name is missing.
 */
function renderMarkdown(e) {
  console.log("Rendering markdown with event: ", e.type);
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
    if(!path) throw new Error("Selected nav link does not containt path dataset");
    if(!documentName) throw new Error("Selected nav link does not have a text? How did you click it???");
    

    fetch(path)
      .then(response => response.text())
      .then(markdown => {
        
        // Parse the fetched file contents as markdown and inject it inside `#content` element
        // eslint-disable-next-line no-undef
        document.getElementById('content').innerHTML = marked.parse(markdown);
        
        // Change the pages title
        document.title = "LOREm | " + documentName;
        
        console.log("Markdown successfully rendered, adding event listeners to anchors");
        
        // Add event listener to all <a data-path=""> tags in a given .md document
        document.querySelectorAll('a[data-path]').forEach(a => {
          a.addEventListener('click', renderMarkdown);
        });

        // View has changed, new document rendered. Update attribiute indexes for controls and their event handelers
        updateControlsIndexes(documentName);
      })
      .catch(error => console.error('Error while rendering markdown:', error));

  } catch(er) {
    console.error(er);
  }
}

/**
 * Updates the data-path attributes of the navigation controls based on the current document name.
 * 
 * This function finds the current document's index in the flattened tree structure and updates
 * the `data-path` attributes of the left and right arrow controls to point to the previous and 
 * next documents, respectively. It handles edge cases where the current document is the first 
 * or last in the list by wrapping around to the end or start of the list.
 *
 * @param {string} currentDocumentName - The name of the current document being viewed.
 * @throws {Error} Throws an error if the `selectedTree` or `flatTree` is not set.
 */
function updateControlsIndexes(currentDocumentName) {
  if(!selectedTree) throw new Error("No tree structure selected");
  if(!flatTree) throw new Error("No flatten verions of a tree structure");
  if(!flatTree.files) throw new Error("No files found in the flat tree");
  
  let leftArrow = document.getElementById('left-arrow-control');
  let rightArrow = document.getElementById('right-arrow-control');

  let currentIndex = flatTree.files.findIndex(file => file.relativePath.includes(currentDocumentName));
  if(currentIndex === -1) throw new Error(`Document "${currentDocumentName}" not found in the flat tree`);

  leftArrow.classList.remove('hidden');
  rightArrow.classList.remove('hidden');

  let n = flatTree.files.length;
  let prevIndex = (currentIndex - 1 + n) % n;
  let nextIndex = (currentIndex + 1) % n;

  leftArrow.setAttribute('data-path', flatTree.files[prevIndex].relativePath)
  rightArrow.setAttribute('data-path', flatTree.files[nextIndex].relativePath)
}
/**
 * Changes the view based on the selected view and tree, and updates the UI accordingly.
 * 
 * This function clears the root element and creates a new navbar based on the selected tree.
 * It also creates and appends a content element and arrow controls to the root element, 
 * adding event listeners to the controls for navigation.
 * 
 * Additionaly, whenever the user changes its view, the search menu will also be changed.
 * It's creaded anew and filled with `flatTree` representing the current directory layout for given view
 * // TODO: Add more throws
 * @throws {Error} Throws an error if the `selectedView` or `selectedTree` is not set.
 */
async function changeView(viewName) {

  function createContentElement() {
    let contentElement = document.createElement('div');
    contentElement.id = "content";
    ROOT.append(contentElement); 
  }

  if(viewName !== "DND" && viewName !== "TWD") {
    return;
  }

  selectedView = viewName;

  switch(viewName) {
    case "DND":
      selectedTree = new CTree(DND_TREE);
      break;
    case "TWD":
      selectedTree = new CTree(TWD_TREE);
      break;
    default:
      throw new Error("Unrecognized view, got: " + viewName);
  }

  if(!selectedTree) throw new TypeError("Selected tree is undefined, default case omitted");

  flatTree = new CFlatTree(selectedTree);
  
  if(!flatTree || flatTree.files.length == 0) {
    throw new Error("Error after parsing selectedTree into flatTree, undefined or empty");
  }

  // When all variables are set, create a new view and build all its components

  // 1. Clear the root element
  await clearRootElement();
  
  // 2. Create the navbar based on the `selectedTree`
  await createNavbar(ROOT, renderMarkdown, selectedTree);
  
  // 3. Create an empty div with `#content` (it's going to be filled with data by `renderMarkdown` function)
  createContentElement();

  // 4. Create the arrow controlls
  createArrowControls(ROOT, flatTree, renderMarkdown);

  // 5. Create the search menu
  // createSearchMenu(ROOT, flatTree, renderMarkdown);
  createSearchMenu(
    document.getElementById('content'),
    flatTree,
    renderMarkdown
  )
}

// ##############################P###################################################################################################################

window.onload = () => {
  createBootScreen(ROOT, changeView);
};