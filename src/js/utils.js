
const require = (pathFile) => {
    let rR = `<div>file ${pathFile} no found</div>`;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET", pathFile, false);
    xmlhttp.send();
    if(xmlhttp.status == 200) rR = xmlhttp.responseText;
    return rR;
  }
  
  class LineBreakTransformer {
    constructor() {
      // A container for holding stream data until a new line.
      this.container = '';
    }
  
    transform(chunk, controller) {
        // Handle incoming chunk
        this.container += chunk;
        // const lines = this.container.split('X');
        // const lines = this.container.split('\r\n');
        const lines = this.container.split(/[\s,\r,\n,x,X]/);
        this.container = lines.pop();
        lines.forEach(line => controller.enqueue(line));
    }
  
    flush(controller) {
      // Flush the stream.
      controller.enqueue(this.container);
    }
  } 
  