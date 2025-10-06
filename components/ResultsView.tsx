
import React, { useState } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { ZipIcon } from './icons/ZipIcon';
import { OUTPUT_FILENAME } from '../constants';

interface ResultsViewProps {
    fileName: string;
    extractedFileNames: string[];
    combinedContent: string;
    onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({
    fileName,
    extractedFileNames,
    combinedContent,
    onReset,
}) => {
    const [projectName, setProjectName] = useState('');

    const getFinalFileName = () => {
        if (projectName.trim()) {
            const sanitized = projectName.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-._]/g, '');
            return `${sanitized || 'projeto'}.txt`;
        }
        return OUTPUT_FILENAME;
    };
    
    const finalFileName = getFinalFileName();

    const handleDownload = () => {
        const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-700/50 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-3 md:mb-0">
                    <ZipIcon className="w-8 h-8 text-indigo-300 mr-3 shrink-0" />
                    <div>
                        <span className="text-gray-400 text-sm">Arquivo Original</span>
                        <p className="font-semibold text-white break-all">{fileName}</p>
                    </div>
                </div>
                 <button
                    onClick={onReset}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
                >
                    Processar Outro
                </button>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-300">
                    {extractedFileNames.length} arquivos encontrados e combinados:
                </h3>
                <div className="max-h-60 overflow-y-auto bg-gray-900/70 p-3 rounded-lg border border-gray-700">
                    <ul className="space-y-2">
                        {extractedFileNames.map((name, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-300">
                                <FileTextIcon className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                                <span className="truncate">{name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="project-name" className="block mb-2 text-sm font-medium text-gray-300">
                    Nome do projeto (opcional para o nome do arquivo):
                </label>
                <input
                    type="text"
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    placeholder="ex: meu-projeto-incrivel"
                />
            </div>

            <div className="text-center">
                <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Baixar {finalFileName}
                </button>
            </div>
        </div>
    );
};

export default ResultsView;
