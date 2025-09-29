import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploaderProps {
    onFileSelect: (file: File, extensions: string[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [extensions, setExtensions] = useState('.txt, .md, .js, .ts, .tsx, .json, .css, .html');
    const [processAll, setProcessAll] = useState(false);

    const handleFileSelected = useCallback((file: File) => {
        const parsedExtensions = processAll 
            ? [] 
            : extensions
                .split(',')
                .map(ext => ext.trim().toLowerCase())
                .filter(Boolean)
                .map(ext => (ext.startsWith('.') ? ext : `.${ext}`));
        onFileSelect(file, parsedExtensions);
    }, [onFileSelect, extensions, processAll]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelected(e.target.files[0]);
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    
    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelected(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [handleFileSelected]);

    const dragDropClasses = isDragging
        ? 'border-indigo-500 bg-gray-700/50 scale-105'
        : 'border-gray-600 hover:border-indigo-500 hover:bg-gray-800/60';

    return (
        <div className="w-full">
            <div className="flex items-center justify-center w-full">
                <label
                    htmlFor="dropzone-file"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${dragDropClasses}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-10 h-10 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold text-indigo-400">Clique para enviar</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500">Apenas arquivos .ZIP são suportados</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept=".zip" onChange={handleFileChange} />
                </label>
            </div>
             <div className="mt-6 space-y-4">
                <div className="flex items-center">
                    <input
                        id="process-all"
                        type="checkbox"
                        checked={processAll}
                        onChange={(e) => setProcessAll(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="process-all" className="ml-3 text-sm font-medium text-gray-300 cursor-pointer">
                        Coletar todos os tipos de arquivo do ZIP
                    </label>
                </div>
                <div>
                    <label htmlFor="extensions" className={`block mb-2 text-sm font-medium transition-colors ${processAll ? 'text-gray-500' : 'text-gray-300'}`}>
                        Ou especifique os tipos de arquivo a serem incluídos (separados por vírgula):
                    </label>
                    <input
                        type="text"
                        id="extensions"
                        value={extensions}
                        onChange={(e) => setExtensions(e.target.value)}
                        className="bg-gray-900 border border-gray-600 text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        placeholder="e.g. .txt, .md, .js"
                        aria-describedby="extensions-help"
                        disabled={processAll}
                    />
                     <p id="extensions-help" className="mt-2 text-xs text-gray-500">
                        Se a opção acima não estiver marcada e este campo estiver vazio, todos os arquivos serão processados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FileUploader;
