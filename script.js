import { applyParallax } from "./scripts/utils.js";
import { DND_TREE } from "./scripts/DND.js";

/**
 * @type {string}
 */
var selectedView = "";


function clearRootElement() {
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.classList.remove('fullwidth') 
}

function renderMarkdown(e) {
  console.log("Rendering markdown...")
  try {
    const path = selectedView + "/" + e.target.dataset.path;
    if(!path) {
      throw new Error("Selected nav linkt does not containt path dataset")
    }

    fetch(path)
      .then(response => response.text())
      .then(markdown => {
        
        document.getElementById('content').innerHTML = marked.parse(markdown);
        document.title = "LOREm | " + e.target.innerText;
        
        console.log("Markdown successfully rendered, adding event listeners to anchors");
        
        document.querySelectorAll('a[data-path]').forEach(a => {
          a.addEventListener('click', renderMarkdown)
        })
      })
      .catch(error => console.error('Error while rendering markdown:', error));

  } catch(er) {
    console.error(er);
  }
}

function createNavbar() {
  console.log("Creating navbar...")
  var tree;
  const navbar = document.createElement('nav');

  
  if(selectedView == "DND") {
    tree = DND_TREE;
  } else if(selectedView == "TWD") {
  }

  try {
    tree.forEach(dir => {
      if(!dir.name) { return; }

      let dirWrapper = document.createElement('div');
      let dirName = document.createElement('span');
      dirName.innerText = dir.name;

      dirWrapper.classList.add('dropdown');
      dirName.classList.add('dropbtn');
      
      dirWrapper.append(dirName);

      if(!dir.files) {
        throw new Error(`Directory ${dir.name} does not have any files`);
      }
      let dirDropdownWrapper = document.createElement('div');
      dirDropdownWrapper.classList.add('dropdown-content');
      dir.files.forEach(file => {
        let fileElement = document.createElement('span');
        fileElement.innerText = file.name;
        fileElement.dataset.path = file.relativePath;
        
        // When the menu element is clicked, handle it by fetching and rendering its markdown contents
        fileElement.addEventListener('click', renderMarkdown);
        
        // Appending the file that is inside a given directory to its hoverable parent element
        dirDropdownWrapper.append(fileElement);

      });

      dirWrapper.append(dirDropdownWrapper);
      navbar.append(dirWrapper);
      console.log("Navbar created")
      setTimeout(() => {
        navbar.classList.add('navbar-visible');
        console.log("Navbar visible")
      },1)
    });
    document.getElementById('root').append(navbar);
  } catch(e) {
    console.error(e);
  }
}  


function changeView() {
  try {
    if(!selectedView) {
      throw new Error("No selected view, `selectedView` value = " + `${selectedView}`);
    }
    clearRootElement();
    createNavbar();
    const contentElement = document.createElement('div');
    contentElement.id = "content";
    document.getElementById('root').append(contentElement); 
  } catch(er) {
    console.error(er)
  }
}



function createBootScreen() {
  document.getElementById('root').classList.add('fullwidth')

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
    changeView();
  });

  logoTWD.addEventListener('click', () => {
    selectedView = "TWD";
    changeView();
  });

  bootScreenDNDWrapper.append(backgroundDND, logoDND);
  bootScreenTWDWrapper.append(backgroundTWD, logoTWD);
  bootScreenWrapper.append(bootScreenDNDWrapper, bootScreenTWDWrapper);
  document.getElementById('root').append(bootScreenWrapper);
}


window.onload = () => {
  createBootScreen();
};

