document.addEventListener('DOMContentLoaded', function() {
  var pdfFileInput = document.getElementById('pdf-file');
  var pdfURLInput = document.getElementById('pdf-url');
  var divideButton = document.getElementById('divide-button');
  var downloadButton = document.getElementById('download-button');
  var chooseBtn = document.querySelector('.choose-btn');

  divideButton.addEventListener('click', function() {
    var file = pdfFileInput.files[0];

    if (file) {
      var reader = new FileReader();

      reader.onload = function(e) {
        var typedArray = new Uint8Array(e.target.result);
        var pdfData = new Uint8Array(typedArray.length);

        pdfData.set(typedArray);

        dividePDFPages(pdfData);
      };

      reader.readAsArrayBuffer(file);
    }
  });

  downloadButton.addEventListener('click', function() {
    var url = pdfURLInput.value;

    if (url) {
      fetch(url)
        .then(function(response) {
          return response.blob();
        })
        .then(function(blob) {
          var fileName = getFileNameFromURL(url);
          saveAs(blob, fileName);
        })
        .catch(function(error) {
          console.log('Error: ' + error);
        });
    }
  });

  pdfFileInput.addEventListener('change', function() {
    if (pdfFileInput.files.length > 0) {
      var fileName = pdfFileInput.files[0].name;
      chooseBtn.textContent = fileName;
    } else {
      chooseBtn.textContent = 'Choose File';
    }
  });

  function dividePDFPages(pdfData) {
    pdfjsLib.getDocument(pdfData).promise.then(function(pdfDoc) {
      var numPages = pdfDoc.numPages;

      for (var i = 1; i <= numPages; i++) {
        pdfDoc.getPage(i).then(function(page) {
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          var viewport = page.getViewport({ scale: 1 });

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          var renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          page.render(renderContext).promise.then(function() {
            canvas.toBlob(function(blob) {
              var pageNumber = page.pageNumber;
              var fileName = '' + pageNumber + '.jpg';
              saveAs(blob, fileName);
            }, 'application/pdf');
          });
        });
      }
    });
  }

  function getFileNameFromURL(url) {
    var path = url.split('/').pop();
    return path.split('#')[0].split('?')[0];
  }
});
