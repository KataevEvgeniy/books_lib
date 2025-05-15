import React, { useEffect, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core"; // импортируем необходимые компоненты


const PdfReader = ({ file }) => {
    const [fileUrl, setFileUrl] = useState(null);

    useEffect(() => {
        // Проверяем, был ли передан файл
        if (file) {
            const blob = new Blob([file], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob); // создаем URL для объекта Blob
            setFileUrl(url);

            // Очищаем URL, когда компонент размонтируется
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    return (
        <div style={{ textAlign: "center" }}>
            {fileUrl && (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <Viewer fileUrl={fileUrl} />
                </Worker>
            )}
        </div>
    );
};

export default PdfReader;
