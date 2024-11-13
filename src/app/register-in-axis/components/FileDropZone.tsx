import { Accept, useDropzone } from "react-dropzone";
import { FaSpinner, FaFileAlt, FaTrashAlt } from "react-icons/fa";

export function FileDropZone({
	onDrop,
	accept,
	files,
	onRemove,
	uploading,
}: {
	onDrop: (files: File[]) => void;
	accept: Accept;
	files: { name: string; previewUrl: string }[]; // Adiciona previewUrl para pré-visualização
	onRemove: (index: number) => void;
	uploading: boolean;
}) {
	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept,
		maxSize: 10 * 1024 * 1024,
	});

	return (
		<div
			{...getRootProps()}
			className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50"
		>
			<input {...getInputProps()} />
			{uploading ? (
				<div className="flex items-center space-x-2 text-gray-500">
					<FaSpinner className="animate-spin" />
					<span>Enviando arquivo...</span>
				</div>
			) : files.length > 0 ? (
				<div className="flex flex-col items-center w-full mt-4">
					{files.map((file, index) => (
						<div
							key={index}
							className="flex items-center justify-between w-full mt-2 px-4 py-2 bg-white rounded border"
						>
							<div className="flex items-center space-x-2">
								{file.previewUrl.startsWith("blob:") && file.previewUrl.match(/^.*\.(jpg|jpeg|png|gif)$/i) ? (
									<img src={file.previewUrl} alt="Preview" className="w-8 h-8 rounded" />
								) : (
									<FaFileAlt className="text-gray-500" />
								)}
								<span className="text-sm text-gray-700">{file.name}</span>
							</div>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onRemove(index);
								}}
								className="text-red-500 hover:text-red-700"
							>
								<FaTrashAlt />
							</button>
						</div>
					))}
				</div>
			) : (
				<p className="text-gray-500">Arraste e solte o arquivo ou clique para selecionar</p>
			)}
		</div>
	);
}
