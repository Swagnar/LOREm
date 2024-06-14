/**
 * Applies a parallax effect to the background elements of a given element based on mouse movement.
 * 
 * This function calculates the offset of the mouse pointer relative to the center of the target element
 * and adjusts the position of the background elements to create a parallax effect.
 *
 * @param {MouseEvent} event - The mouse event triggered by the movement of the mouse.
 * @param {HTMLElement} element - The element whose background elements will have the parallax effect applied.
 */
export function applyParallax(event, element) {
  const { clientX, clientY, currentTarget } = event;

  const { width, height, left, top } = currentTarget.getBoundingClientRect();

  const centerX = left + width / 2;
  const centerY = top + height / 2;

  const offsetX = (clientX - centerX) / width * 10;
  const offsetY = (clientY - centerY) / height * 10;

  element.querySelectorAll('.boot-screen-background').forEach(bg => {
    bg.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });
}
/**
 * Flattens a tree structure into a list of file objects.
 * 
 * This function takes a hierarchical tree structure representing directories and their files,
 * and flattens it into a simple list of file objects with their names and relative paths.
 *
 * @param {Object[]} tree - An array of directory objects representing the tree structure. 
 *                          Each directory object should have a `name` (string) and a `files` 
 *                          (array) property. Each file object in the `files` array should 
 *                          have a `name` (string) and `relativePath` (string) property.
 * @returns {Object[]} - Returns an array of file objects, each containing a `name` and `path` property.
 */
export function flattenTree(tree) {
  let flatList = [];

  tree.forEach(folder => {
      folder.files.forEach(file => {
          flatList.push({ name: file.name, path: file.relativePath });
      });
  });

  return flatList;
}
/**
 * Creates a boot screen with two sections: one for DND and one for TWD.
 * 
 * This function appends a new boot screen to the provided root element. 
 * The boot screen consists of two parts, each containing a background and a logo. 
 * The sections will have parallax effects applied to them on mouse movement.
 *
 * @param {HTMLDivElement} rootElement - The root element to which the boot screen will be appended. 
 *                                       It should be a div element.
 * @returns {[HTMLDivElement, HTMLDivElement, HTMLImageElement, HTMLImageElement]} - Returns an array 
 *                                       containing the DND wrapper, TWD wrapper, DND logo, and TWD logo.
 */
export function createBootScreen(rootElement, viewFn) {
  console.log('Creating Boot Screen...');
  rootElement.classList.add('fullwidth');

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

  logoDND.classList.add('boot-screen-logo', 'animate__animated', 'animate__fadeIn');
  logoTWD.classList.add('boot-screen-logo', 'animate__animated', 'animate__fadeIn');

  [bootScreenDNDWrapper, bootScreenTWDWrapper].forEach(wrapper => {
    wrapper.addEventListener('mousemove', (e) => applyParallax(e, wrapper));
  });


  bootScreenDNDWrapper.append(backgroundDND, logoDND);
  bootScreenTWDWrapper.append(backgroundTWD, logoTWD);
  bootScreenWrapper.append(bootScreenDNDWrapper, bootScreenTWDWrapper);
  rootElement.append(bootScreenWrapper);

  console.log("Boot Screen created");
  addEventListenersToBootScreen(bootScreenDNDWrapper, bootScreenTWDWrapper, logoDND, logoTWD, viewFn);
}
/**
 * Adds event listeners to the boot screen elements for hover and click interactions.
 * 
 * This function attaches 'mouseenter' and 'mouseleave' event listeners to the DND and TWD wrappers
 * to apply a gray-out effect to the opposite section when hovered. It also attaches 'click' event 
 * listeners to the DND and TWD logos to set the selected view and tree, flatten the tree, and 
 * change the view accordingly.
 *
 * @param {HTMLElement} wrapperDND - The HTML element representing the DND wrapper.
 * @param {HTMLElement} wrapperTWD - The HTML element representing the TWD wrapper.
 * @param {HTMLImageElement} logoDND - The HTML image element representing the DND logo.
 * @param {HTMLImageElement} logoTWD - The HTML image element representing the TWD logo.
 */
function addEventListenersToBootScreen(wrapperDND, wrapperTWD, logoDND, logoTWD, viewFn) {
  console.log('Adding event listeners to Boot Screen...');
  wrapperDND.addEventListener('mouseenter', () => {
    wrapperTWD.classList.add('gray-out');
  });
  wrapperTWD.addEventListener('mouseenter', () => {
    wrapperDND.classList.add('gray-out');
  });
  wrapperDND.addEventListener('mouseleave', () => {
    wrapperTWD.classList.remove('gray-out');
  });
  wrapperTWD.addEventListener('mouseleave', () => {
    wrapperDND.classList.remove('gray-out');
  });

  logoDND.addEventListener('click', function() {
    viewFn('DND');
  });
  
  logoTWD.addEventListener('click', function() {
    viewFn('TWD');
  });

  console.log('Event listeners added to Boot Screen');
}
/**
 * Creates a navigation bar from a given source tree and appends it to the root element.
 * 
 * This function creates a navbar containing dropdown menus based on a given source tree.
 * Each directory in the source tree is represented as a dropdown button, and its files
 * are displayed as items within the dropdown. Clicking on a file triggers the provided
 * click handler function.
 *
 * @param {HTMLDivElement} rootElement - The root element to which the navbar will be appended. 
 *                                       It should be a div element.
 * @param {function} clickHandler - A function to be called when a file in the navbar is clicked. 
 *                                  The function should handle the file click event.
 * @param {CTree} sourceTree - An array of directory objects representing the structure of 
 *                                the navbar. Each directory object should have a `name` 
 *                                (string) and a `files` (array) property. Each file object 
 *                                in the `files` array should have a `name` (string) and 
 *                                `relativePath` (string) property.
 * @throws {TypeError} - Throws an error if the source tree or any of its directories or files 
 *                       do not have the expected structure.
 */
export async function createNavbar(rootElement, clickHandeler, sourceTree) {
  if(!sourceTree || sourceTree == []) throw new TypeError(`Source tree is undefined or empty`);

  console.log("Creating navbar...");

  const navbar = document.createElement('nav');
  
  try {

    sourceTree.directories.forEach(dir => {

      if(!dir.name) throw new TypeError(`No direcory name found, got ${typeof dir.name} expected string`);
      if(!dir.files) throw new TypeError(`Directory ${dir.name} does not have any files`);

      let navDropdownButtonWrapper = document.createElement('div');
      let navDropdownButtonNameElement = document.createElement('span');

      navDropdownButtonNameElement.innerText = dir.name;

      navDropdownButtonWrapper.classList.add('dropdown');
      navDropdownButtonNameElement.classList.add('dropbtn');
      
      navDropdownButtonWrapper.append(navDropdownButtonNameElement);


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
        navDropdownContentElement.addEventListener('click', clickHandeler);
        
        // Appending the file that is inside a given directory to its hoverable parent element
        navDropdownContentWrapper.append(navDropdownContentElement);

      });

      navDropdownButtonWrapper.append(navDropdownContentWrapper);
      navbar.append(navDropdownButtonWrapper);
      console.log("Navbar created");
    });
    rootElement.append(navbar);

    navbar.classList.add('animate__animated', 'animate__fadeIn');
  } catch(er) {
    console.error("There has been an error while creating the navbar: ", er);
  }
}