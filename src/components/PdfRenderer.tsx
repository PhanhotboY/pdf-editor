const PdfRenderer = ({ pdfUrl }: { pdfUrl?: string }) => {
  return pdfUrl ? (
    <iframe src={pdfUrl} width='100%' height='100%' title='PDF Viewer'></iframe>
  ) : (
    <div className='w-full h-full flex items-center justify-center'>
      <p className='text-gray-600'>Upload a PDF to render</p>
    </div>
  );
};

export default PdfRenderer;
