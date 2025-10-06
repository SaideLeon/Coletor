
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface InputViewProps {
    onFileSelect: (file: File, extensions: string[]) => void;
    onGitHubImport: (repoUrl: string, extensions: string[]) => Promise<void>;
}

type InputMode = 'zip' | 'github';

const InputView: React.FC<InputViewProps> = ({ onFileSelect, onGitHubImport }) => {
    // Shared State
    const [extensions, setExtensions] = useState('.txt, .md, .js, .ts, .tsx, .json, .css, .html');
    const [processAll, setProcessAll] = useState(false);
    
    // Mode State
    const [mode, setMode] = useState<InputMode>('zip');

    // ZIP Uploader State
    const [isDragging, setIsDragging] = useState(false);

    // GitHub Importer State
    const [repoUrl, setRepoUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const getParsedExtensions = useCallback(() => {
        return processAll
            ? []
            : extensions
                .split(',')
                .map(ext => ext.trim().toLowerCase())
                .filter(Boolean)
                .map(ext => (ext.startsWith('.') ? ext : `.${ext}`));
    }, [extensions, processAll]);

    // ZIP Handlers
    const handleFileSelected = useCallback((file: File) => {
        onFileSelect(file, getParsedExtensions());
    }, [onFileSelect, getParsedExtensions]);

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

    // GitHub Handler
    const handleImportClick = useCallback(async () => {
        if (!repoUrl || isImporting) return;
        setIsImporting(true);
        await onGitHubImport(repoUrl, getParsedExtensions());
        // No need for a `finally` block to reset `isImporting`, 
        // as the parent component will change status and unmount this view.
    }, [onGitHubImport, repoUrl, getParsedExtensions, isImporting]);


    const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`flex items-center justify-center w-1/2 px-4 py-3 font-semibold text-sm rounded-t-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800/50 ${
                active
                    ? 'bg-gray-700/60 text-white border-b-2 border-indigo-500'
                    : 'bg-gray-900/40 text-gray-400 hover:bg-gray-700/40'
            }`}
        >
            {children}
        </button>
    );

    const SharedExtensionOptions = () => (
         <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
            <div className="flex items-center">
                <input
                    id="process-all"
                    type="checkbox"
                    checked={processAll}
                    onChange={(e) => setProcessAll(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="process-all" className="ml-3 text-sm font-medium text-gray-300 cursor-pointer">
                    Coletar todos os tipos de arquivo
                </label>
            </div>
            <div>
                <label htmlFor="extensions" className={`block mb-2 text-sm font-medium transition-colors ${processAll ? 'text-gray-500' : 'text-gray-300'}`}>
                    Ou especifique os tipos de arquivo (separados por vírgula):
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
    );
    
    const dragDropClasses = isDragging
        ? 'border-indigo-500 bg-gray-700/50 scale-105'
        : 'border-gray-600 hover:border-indigo-500 hover:bg-gray-800/60';

    return (
        <div className="w-full">
            <div className="flex border-b border-gray-700 mb-6">
                <TabButton active={mode === 'zip'} onClick={() => setMode('zip')}>
                    <UploadIcon className="w-5 h-5 mr-2" />
                    Enviar Arquivo .ZIP
                </TabButton>
                <TabButton active={mode === 'github'} onClick={() => setMode('github')}>
                    <GitHubIcon className="w-5 h-5 mr-2" />
                    Importar do GitHub
                </TabButton>
            </div>

            {mode === 'zip' && (
                <div className="animate-fade-in">
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
                </div>
            )}
            
            {mode === 'github' && (
                <div className="animate-fade-in space-y-4">
                    <div>
                        <label htmlFor="github-url" className="block mb-2 text-sm font-medium text-gray-300">
                            URL do Repositório GitHub
                        </label>
                        <input
                            type="url"
                            id="github-url"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleImportClick()}
                            className="bg-gray-900 border border-gray-600 text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            placeholder="https://github.com/facebook/react"
                            required
                        />
                    </div>
                    <button
                        onClick={handleImportClick}
                        disabled={!repoUrl || isImporting}
                        className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-300 disabled:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isImporting ? (
                            <>
                                <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                                Importando...
                            </>
                        ) : (
                            'Importar e Coletar Código'
                        )}
                    </button>
                </div>
            )}
            
            <SharedExtensionOptions />
        </div>
    );
};

export default InputView;
