
import React, { useState, useCallback } from 'react';
import { ProcessStatus } from './types';
import FileUploader from './components/FileUploader';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';

// Make JSZip available from the global scope (loaded via CDN)
declare const JSZip: any;

const App: React.FC = () => {
    const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.Idle);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [extractedFileNames, setExtractedFileNames] = useState<string[]>([]);
    const [combinedContent, setCombinedContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleFileProcess = useCallback(async (file: File, extensions: string[]) => {
        if (!file) return;

        setStatus(ProcessStatus.Processing);
        setUploadedFile(file);
        setExtractedFileNames([]);
        setCombinedContent('');
        setError(null);

        try {
            const zip = await JSZip.loadAsync(file);
            let contentBuilder = `Conteúdo coletado do arquivo: ${file.name}\n`;
            if (extensions.length > 0) {
                contentBuilder += `Filtrando por extensões: ${extensions.join(', ')}\n\n`;
            } else {
                contentBuilder += `\n`;
            }

            const fileNames: string[] = [];
            
            const filePromises = Object.keys(zip.files).map(async (filename) => {
                const zipEntry = zip.files[filename];
                if (!zipEntry.dir) {
                    const shouldInclude = extensions.length === 0 || extensions.some(ext => filename.toLowerCase().endsWith(ext));

                    if (shouldInclude) {
                        fileNames.push(filename);
                        const fileContent = await zipEntry.async('string');
                        contentBuilder += `========================================\n`;
                        contentBuilder += `Arquivo: ${filename}\n`;
                        contentBuilder += `========================================\n\n`;
                        contentBuilder += fileContent;
                        contentBuilder += `\n\n`;
                    }
                }
            });

            await Promise.all(filePromises);

            if (fileNames.length === 0) {
                setError(`Nenhum arquivo correspondente às extensões especificadas (${extensions.join(', ')}) foi encontrado no arquivo ZIP.`);
                setStatus(ProcessStatus.Error);
                return;
            }

            setExtractedFileNames(fileNames.sort());
            setCombinedContent(contentBuilder);
            setStatus(ProcessStatus.Success);
        } catch (err) {
            console.error("Error processing file:", err);
            setError('Falha ao processar o arquivo. Certifique-se de que é um arquivo ZIP válido e não está corrompido.');
            setStatus(ProcessStatus.Error);
        }
    }, []);

    const handleReset = () => {
        setStatus(ProcessStatus.Idle);
        setUploadedFile(null);
        setExtractedFileNames([]);
        setCombinedContent('');
        setError(null);
    };
    
    const renderContent = () => {
        switch (status) {
            case ProcessStatus.Idle:
                return <FileUploader onFileSelect={handleFileProcess} />;
            case ProcessStatus.Processing:
                return <ProcessingView fileName={uploadedFile?.name || ''} />;
            case ProcessStatus.Success:
                return (
                    <ResultsView
                        fileName={uploadedFile?.name || ''}
                        extractedFileNames={extractedFileNames}
                        combinedContent={combinedContent}
                        onReset={handleReset}
                    />
                );
            case ProcessStatus.Error:
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Ocorreu um Erro</h2>
                        <p className="text-red-300 bg-red-900/50 p-4 rounded-lg">{error}</p>
                        <button
                            onClick={handleReset}
                            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-3xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                        Coletor de Código
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Envie um arquivo .ZIP para extrair e combinar o conteúdo de todos os arquivos de texto.
                    </p>
                </header>
                <main className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
                    {renderContent()}
                </main>
                <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>Desenvolvido com React, TypeScript e Tailwind CSS.</p>
                    <p className="mt-1 text-xs text-gray-600">Nota: O processamento de arquivos .RAR não é suportado no momento devido a limitações do navegador.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
