const fs = require('fs');
const readline = require('readline');
const http = require('http');

var url = require("url");
var path = require("path");

function pDownload(url, dest){
  var file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    var responseSent = false; // flag to make sure that response is sent only once.
    http.get(url, response => {
      response.pipe(file);
      file.on('finish', () =>{
        file.close(() => {
          if(responseSent)  return;
          responseSent = true;
          resolve();
        });
      });
    }).on('error', err => {
        if(responseSent)  return;
        responseSent = true;
        reject(err);
    });
  });
}

async function processLineByLine() {
  const fileStream = fs.createReadStream('links.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  var i = 0;
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    
	
	let parsed = url.parse(line);
	let filename = path.basename(parsed.pathname);
	let folder = parsed.pathname.replace(filename,"");	
	folder = folder.substring(1, folder.length-1 );
		
	if(!fs.existsSync(folder)){
		fs.mkdirSync(folder, { recursive: true });
	}
	
	pDownload(line, folder+'/'+filename )
	.then( ()=> console.log('downloaded file no issues...'))
	.catch( e => console.error('error while downloading', e));
	
  }
}

processLineByLine();