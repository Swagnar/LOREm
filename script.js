import { createBootScreen, createNavbar, flattenTree } from "./scripts/utils.js";
import { createArrowControls, createSearchMenu, addEventListenersToSearchMenu } from "./scripts/controls.js";
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
  ROOT.classList.remove('fullwidth') ;
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
          a.addEventListener('click', renderMarkdown);
        });

        // View has changed, new document rendered. Update attribiute indexes for controls and their event handelers
        updateControlsIndexes(documentName)
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
 * Changes the view based on the selected view and tree, and updates the UI accordingly.
 * 
 * This function clears the root element and creates a new navbar based on the selected tree.
 * It also creates and appends a content element and arrow controls to the root element, 
 * adding event listeners to the controls for navigation.
 *
 * @throws {Error} Throws an error if the `selectedView` or `selectedTree` is not set.
 */
function changeView(viewName) {

  selectedView = viewName;

  switch(viewName) {
    case "DND":
      selectedTree = DND_TREE;
      break;
    case "TWD":
      selectedTree = TWD_TREE;
      break;
    default:
      throw new Error("Unrecognized view, got: " + viewName);
  }
  if(!selectedTree) throw new TypeError("Selected tree is undefined, default case omitted");

  flatTree = flattenTree(selectedTree);
  
  if(!flatTree || flatTree.length == 0) {
    throw new Error("Error after parsing selectedTree into flatTree, undefined or empty");
  }

  clearRootElement();
  
  createNavbar(ROOT, renderMarkdown, selectedTree);

  
  const contentElement = document.createElement('div');
  contentElement.id = "content";
  ROOT.append(contentElement); 

  createArrowControls(ROOT, renderMarkdown, flatTree);

  const [searchInput, searchButton] = createSearchMenu(ROOT, flatTree);
  addEventListenersToSearchMenu(searchInput, searchButton, flatTree, renderMarkdown);
    

}


// #################################################################################################################################################

window.onload = () => {
  createBootScreen(ROOT, changeView);
};