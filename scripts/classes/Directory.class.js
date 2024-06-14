import { CFile } from "./File.class.js";

export class CDirectory {
  constructor(name) {
    this.name = name;
    this.files = [];
  }

  /**
   * 
   * @param {CFile} file 
   */
  addFile(file) {
    if(file instanceof CFile) {
      this.files.push(file);
    } else {
      throw new Error('addFile only accepts instances of File');
    }
  }

  addFiles(files) {
    files.forEach(file => this.addFile(file));
  }
}