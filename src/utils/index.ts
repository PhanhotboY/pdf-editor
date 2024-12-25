import { PDFDocument, PDFName, PDFPage, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// Configure the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;

async function extractTextCoordinates(page: pdfjsLib.PDFPageProxy) {
  // const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

  const textContent = await page.getTextContent();
  console.log(textContent);

  const coordinates = { website: {}, phone: {} } as {
    website: any;
    phone: any;
  };
  textContent.items.forEach((item: any) => {
    if (item.str.includes('www.tns.com.vn')) {
      coordinates.website = {
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
        text: item.str,
      };
    }
    if (item.str.includes('0345785450')) {
      coordinates.phone = {
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
        text: item.str,
      };
    }
  });

  return coordinates;
}

function downloadPdf(pdfBytes: BlobPart, fileName: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function removePages(pdf: PDFDocument, pages2Deleted: string) {
  const pages = pages2Deleted.split(',').map(Number);

  pages
    .sort((a, b) => b - a)
    .forEach(async (pageIndex) => {
      pdf?.removePage(pageIndex - 1);
    });

  return await pdf?.save();
}
const createPageLinkAnnotation = (page: PDFPage, cord: any, uri: string) =>
  page.doc.context.register(
    page.doc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [
        cord.x - 2,
        cord.y - 12,
        cord.x + cord.width - 2,
        cord.y + cord.height,
      ],
      Border: [0, 0, 0],
      A: {
        Type: 'Action',
        S: 'URI',
        URI: 'https://' + uri,
      },
    })
  );

const replacePdfFooter = async (
  pdf: PDFDocument,
  website: string,
  phone: string
) => {
  const pages = pdf.getPages();
  const helveticaFont = await pdf.embedFont('Helvetica');

  const pdfJs = await pdfjsLib.getDocument({ data: await pdf.save() }).promise;

  const fontSize = 10;
  for (const i in pages) {
    const page = pages[i];

    try {
      const { website: webCord, phone: phoneCord } =
        await extractTextCoordinates(await pdfJs.getPage(Number(i) + 1));

      page.drawRectangle({
        x: webCord.x - 2,
        y: webCord.y - 2,
        width: webCord.width - 2,
        height: webCord.height + 2,
        color: rgb(1, 1, 1),
      });
      page.drawText(website, {
        x: webCord.x + 2,
        y: webCord.y,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      const link = createPageLinkAnnotation(page, webCord, website);
      page.node.set(PDFName.of('Annots'), pdf.context.obj([link]));

      page.drawRectangle({
        x: phoneCord.x - 2,
        y: phoneCord.y - 2,
        width: phoneCord.width + 5,
        height: phoneCord.height + 2,
        color: rgb(1, 1, 1),
      });
      page.drawText(phone, {
        x: phoneCord.x + 2,
        y: phoneCord.y,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    } catch (err) {
      console.error(err);
    }
  }

  return await pdf.save();
};

export { downloadPdf, removePages, extractTextCoordinates, replacePdfFooter };
