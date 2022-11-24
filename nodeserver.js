var http = require('http');
var url = require('url');
var fs = require('fs');
var mime = require('mime');
var imageDB = require('./imageDB');
var bl = require('bl');
var multiparty = require('multiparty');

function fileNotFound(responce) {
    responce.writeHead(404, { 'Content-Type': 'text/html' });

    responce.end(
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<title>File Not Found</title>' +
        '</head>' +
        '<body>' +
        '<h1>File Not Found</h1>' +
        '<p>The file you requested could not be found. Please check the URL and try again</p>' +
        '</body>' +
        '</html>'
    );
}

function writeJSON(object, responce) {
    responce.writeHead(200, {
        'Content-Type': 'application/json: charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Orgin, X-Requested-With, Content-Type, Accept'
    });
    responce.end(JSON.stringify(object));
}

function writeImage(image, responce){
    responce.writeHead(200, {
        'Content-Type': image.type,
        'Content-Length': image.size,
    });
    responce.end(image.data);
}

function uploadFile(request, responce) {
    var form = new multiparty.Form();

    form.on('error', function (err) {
        console.log(err);
        fileNotFound(responce);
    });
    form.on('part', function (part) {
        function uploadPart(err, data) {
            if (err) {
                console.log(err);
                fileNotFound(responce);
            } else {
                imageDB.uploadFile({
                    name: part.filename,
                    type: part.headers["content-type"],
                    size: part.byteCount,
                    data: data
                }, function (resp) {
                    writeJSON(resp, responce);
                });
            }

        }
        console.log(part);
        part.pipe(bl(uploadPart));
    });

    form.parse(request);
}
function servePage(path, responce) {
    var stream = fs.createReadStream(path);

    responce.writeHead(200, { 'Content-Type': mime.getType(path) });

    stream.on('error', function (err) {
        console.log(err);
        fileNotFound(responce);
    });

    stream.on('data', function (chunk) {
        responce.write(chunk);
    });

    stream.on('end', function () {
        responce.end();
    });
}

http.createServer(function (request, responce) {
    var urlRequest = url.parse(request.url, true);

    console.log(request.method + ' ' + urlRequest.pathname);

    if (urlRequest.pathname === '/images/listImages') {
        imageDB.listImages(function (data) {
            writeJSON(data, responce);
        });
    } else if (urlRequest.pathname === '/images/fetchImage') {
        imageDB.fetchImage(urlRequest.query.id, function (image) {
            writeImage(image, responce);
        });
    } else if (urlRequest.pathname === '/images/uploader') {
        uploadFile(request, responce);

    } else if (urlRequest.pathname.substring(0, 8) === "/images/") {
        servePage('/Applications/XAMPP/xamppfiles/htdocs/CIS233W/lab8/images/' + urlRequest.pathname.substring(8), responce);
    } else {
        fileNotFound(responce);
    }


}).listen(process.argv[2]);