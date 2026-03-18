import React from 'react';
import { WebView } from 'react-native-webview';

const DocxGenerator = ({ htmlContent }) => {
  const htmlContentEscaped = encodeURIComponent(htmlContent);

  const generateDocx = `
    <html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/docx/7.1.0/docx.min.js"></script>
    </head>
    <body>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const { Document, Packer, Paragraph, TextRun } = docx;
          
          // Simple DOCX content
          const docx = new Document({
            sections: [
              {
                properties: {},
                children: [
                  new Paragraph({
                    children: [
                      new TextRun('Hello, world!')
                    ],
                  }),
                ],
              },
            ],
          });

          // Generate and save DOCX file
          Packer.toBlob(docx).then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'document.docx';
            link.click();
          }).catch(error => {
            console.error('Error generating DOCX:', error);
          });
        });
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: generateDocx }}
      javaScriptEnabled={true}
      onLoadEnd={() => console.log('WebView loaded')}
      onError={(error) => console.error('WebView error:', error)}
    />
  );
};

export default DocxGenerator;
