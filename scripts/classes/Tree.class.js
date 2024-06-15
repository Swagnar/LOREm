import { CDirectory } from "./Directory.class.js";
import { CFile } from "./File.class.js";

export class CTree {
  constructor(tree) {
    this.directories = [];
    this.buildTree(tree);
  }

  buildTree(tree) {
    tree.forEach(directory => {
      let dir = new CDirectory(directory.name);
      directory.files.forEach(file => {
        dir.addFile(new CFile(file.name, file.relativePath));
      });
      this.directories.push(dir);
    });
  }

  toFlatArray() {
    let flatArray = [];
    this.directories.forEach(directory => {
      flatArray = flatArray.concat(directory.files);
    });
    return flatArray;
  }
}

export class CFlatTree {
  constructor(tree) {
    this.files = [];
    this.buildFlatTree(tree);
  }

  buildFlatTree(tree) {
    tree.directories.forEach(directory => {
      directory.files.forEach(file => {
        this.files.push(new CFile(file.name, file.relativePath));
      });
    });
  }

  getFileByName(name) {
    return this.files.find(file => file.relativePath.includes(name));
  }
  getFileByIndex(index) {
    return this.files[index];
  }
}