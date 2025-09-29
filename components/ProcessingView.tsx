
import React from 'react';
import { ZipIcon } from './icons/ZipIcon';

interface ProcessingViewProps {
    fileName: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ fileName }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-4">
                <ZipIcon className="w-16 h-16 text-indigo-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-200 mt-4">Processando arquivo...</h2>
            <p className="text-gray-400 break-all">{fileName}</p>
        </div>
    );
};

export default ProcessingView;
