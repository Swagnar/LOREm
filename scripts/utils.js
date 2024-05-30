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

export function flattenTree(tree) {
  let flatList = [];

  tree.forEach(folder => {
      folder.files.forEach(file => {
          flatList.push({ name: file.name, path: file.relativePath });
      });
  });

  return flatList;
}

