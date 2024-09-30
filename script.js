document.getElementById('convert-btn').addEventListener('click', function() {
  const fileInput = document.getElementById('pdf-file');
  const output = document.getElementById('xml-output');
  const downloadBtn = document.getElementById('download-btn');

  if (fileInput.files.length === 0) {
    alert('Please select a PDF file.');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function() {
    const typedArray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
      let xmlString = `<pdfDocument>\n`;

      let totalPages = pdf.numPages;
      let pagePromises = [];

      for (let i = 1; i <= totalPages; i++) {
        pagePromises.push(pdf.getPage(i).then(function(page) {
          return page.getTextContent().then(function(textContent) {
            let pageXml = `<page number="${i}">\n`;

            textContent.items.forEach(function(textItem) {
              pageXml += `<text>${textItem.str}</text>\n`;
            });

            pageXml += `</page>\n`;
            return pageXml;
          });
        }));
      }

      Promise.all(pagePromises).then(function(pagesXml) {
        xmlString += pagesXml.join('');
        xmlString += `</pdfDocument>`;
        output.textContent = xmlString;
        enableDownload(xmlString); // Chama a função para permitir o download
      });
    });
  };

  reader.readAsArrayBuffer(file);
});

function enableDownload(xmlContent) {
  const downloadBtn = document.getElementById('download-btn');
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);

  downloadBtn.style.display = 'block'; // Mostra o botão de download
  downloadBtn.href = url; // Atribui a URL gerada ao atributo href do <a>
  downloadBtn.download = 'converted.xml'; // Define o nome do arquivo baixado
}
