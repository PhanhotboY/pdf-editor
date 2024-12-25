import { PDFDocument } from 'pdf-lib';
import { useEffect, useRef, useState } from 'react';
import Loading from './components/Loading';
import PdfRenderer from './components/PdfRenderer';
import { downloadPdf, removePages, replacePdfFooter } from './utils';

// export const meta: MetaFunction = () => {
//   return [
//     { title: "New Remix App" },
//     { name: "description", content: "Welcome to Remix!" },
//   ];
// };

export default function App() {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer>();
  const [fileName, setFileName] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdf, setPdf] = useState<PDFDocument>();
  const [pages2Deleted, setPages2Deleted] = useState('1,2,3,101,102');
  const [website, setWebsite] = useState('iconictalents.vn');
  const [phone, setPhone] = useState('0931246911');

  const inputFile = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];

    if (file.size) {
      setFileName(file.name);

      // Read the file as an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      setPdfBytes(new Uint8Array(arrayBuffer));
    }
  };

  useEffect(() => {
    if (pdfBytes) {
      URL.revokeObjectURL(pdfUrl);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      PDFDocument.load(pdfBytes).then((pdf) => {
        setPdf(pdf);
      });

      return () => {
        URL.revokeObjectURL(pdfUrl);
      };
    }
  }, [pdfBytes?.byteLength]);

  return (
    <div className='container grid grid-cols-12 h-screen bg-gray-100 divide-x'>
      <div className='col-span-4 flex flex-col items-center justify-center'>
        <div className='relative bg-white p-8 rounded-lg shadow w-96'>
          <h2 className='text-lg font-semibold mb-4'>Upload a PDF File</h2>

          <input
            type='file'
            accept='.pdf'
            ref={inputFile}
            onChange={handleFileUpload}
            className='block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500'
          />

          {fileName && (
            <div className='mt-4'>
              <strong>File Name:</strong>
              <input
                className='text-sm text-gray-600 p-2 border rounded-lg w-full'
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
          )}

          {pdfBytes?.byteLength && (
            <div className='mt-4'>
              <p className='text-sm text-gray-600'>
                {/* @ts-ignore */}
                <strong>PDF Bytes:</strong> {pdfBytes.slice(0, 10).join(', ')}
                ...
                <span className='text-xs text-gray-500'>
                  {' '}
                  (showing first 10 bytes)
                </span>
              </p>
            </div>
          )}

          {pdfBytes?.byteLength && (
            <button
              className='absolute top-2 right-4 text-2xl'
              onClick={() => {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl('');
                setFileName('');
                setPdfBytes(undefined);
                setPdf(undefined);
                inputFile.current!.value = '';
              }}
            >
              x
            </button>
          )}
        </div>

        <div className='flex flex-col mt-4 w-96'>
          <label>Trang cần xóa (phân cách bởi dấu phẩy):</label>

          <div className='flex gap-2 mt-2'>
            <input
              className='text-sm text-gray-600 p-2 border rounded-lg w-full outline-none'
              type='text'
              value={pages2Deleted}
              onChange={(e) => setPages2Deleted(e.target.value)}
            />
          </div>
        </div>

        <div className='flex w-96 gap-4'>
          <div className='flex flex-col mt-4'>
            <label>Website:</label>

            <div className='flex gap-2 mt-2'>
              <input
                className='text-sm text-gray-600 p-2 border rounded-lg w-full outline-none'
                type='text'
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div className='flex flex-col mt-4'>
            <label>Số điện thoại:</label>

            <div className='flex gap-2 mt-2'>
              <input
                className='text-sm text-gray-600 p-2 border rounded-lg w-full outline-none'
                type='text'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className='flex gap-4 mt-4'>
          <button
            className='w-max bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-60 disabled:pointer-events-none'
            onClick={async () => {
              setLoading(true);
              await removePages(pdf!, pages2Deleted);
              const newPdfBytes = await replacePdfFooter(pdf!, website, phone);
              setPdfBytes(newPdfBytes);
              setLoading(false);
            }}
            disabled={
              !pdfBytes || !pages2Deleted || !website || !phone || loading
            }
          >
            Áp dụng
          </button>

          <button
            className='bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 
          focus:outline-none focus:ring-2 focus:ring-red-500
          disabled:opacity-60 disabled:pointer-events-none'
            onClick={() => downloadPdf(pdfBytes!, fileName)}
            disabled={!pdfBytes || !fileName || loading}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className='relative col-span-8 overflow-auto h-full w-full bg-gray-200'>
        <PdfRenderer pdfUrl={pdfUrl} />
        {/* {pdfBytes && <PdfViewer pdfBytes={pdfBytes} />} */}

        {loading && <Loading />}
      </div>
    </div>
  );
}
