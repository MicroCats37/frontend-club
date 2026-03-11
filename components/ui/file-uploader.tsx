"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "./button";

interface FileUploaderProps {
	value?: File | null;
	onChange: (file: File | null) => void;
	label: string;
	description?: string;
	accept?: string;
	error?: string;
}

export function FileUploader({
	value,
	onChange,
	label,
	description,
	accept = "image/*",
	error,
}: FileUploaderProps) {
	const [preview, setPreview] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			onChange(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleClear = () => {
		onChange(null);
		setPreview(null);
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div className="space-y-2">
			<label className="text-sm font-bold text-[#4A5D4A] block mb-1">
				{label}
			</label>

			<div
				className={`
                    relative group border-2 border-dashed rounded-xl transition-all h-32 flex flex-col items-center justify-center overflow-hidden
                    ${
											value
												? "border-primary/30 bg-primary/5"
												: error
													? "border-rose-200 bg-rose-50"
													: "border-[#E0E7E0] hover:border-primary/40 hover:bg-emerald-50/30"
										}
                `}
			>
				{value && preview ? (
					<div className="absolute inset-0 w-full h-full">
						<Image
							src={preview}
							alt="Preview"
							fill
							className="object-cover transition-transform group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="h-8 rounded-full shadow-lg"
								onClick={handleClear}
							>
								<X className="h-4 w-4 mr-1" />
								Quitar
							</Button>
						</div>
					</div>
				) : (
					<div
						className="flex flex-col items-center justify-center p-4 cursor-pointer w-full h-full"
						onClick={() => inputRef.current?.click()}
					>
						<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
							<Upload className="h-5 w-5 text-primary" />
						</div>
						<p className="text-xs font-semibold text-[#5A705A]">
							{description || "Haz clic para subir"}
						</p>
						<p className="text-[10px] text-[#A0B0A0] mt-0.5">JPG, PNG o WEBP</p>
					</div>
				)}

				<input
					ref={inputRef}
					type="file"
					className="hidden"
					accept={accept}
					onChange={handleFileChange}
				/>
			</div>
			{error && (
				<p className="text-[11px] text-destructive font-medium mt-1">{error}</p>
			)}
		</div>
	);
}
