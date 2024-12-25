import * as PDFJS from 'pdfjs-dist';
import { useEffect } from 'react';

export default function PdfViewer({ pdfBytes }: { pdfBytes: ArrayBuffer }) {
  function renderPDF(canvasContainer: HTMLElement, options?: any) {
    var options = options || { scale: 1 };

    function renderPage(page: any) {
      var viewport = page.getViewport(options.scale);
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      canvasContainer.appendChild(canvas);

      page.render(renderContext);
    }

    function renderPages(pdfDoc: any) {
      for (var num = 1; num <= pdfDoc.numPages; num++)
        pdfDoc.getPage(num).then(renderPage);
    }

    // PDFJS.disableWorker = true;
    const doc = PDFJS.getDocument({ data: pdfBytes });
    renderPages(doc);
  }

  useEffect(() => {
    renderPDF(document.getElementById('holder')!);
  }, [pdfBytes]);

  return <div id='holder'></div>;
}
