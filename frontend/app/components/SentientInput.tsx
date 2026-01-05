/**
 * SentientInput - Advanced multi-modal chat input with image support
 * 
 * Purpose: Professional AI chat-style input with embedded image previews
 * Features: Auto-resize, drag-drop, paste, file attachment, send button
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Send, X } from 'lucide-react';

interface SentientInputProps {
	onSubmit: (data: { text: string; file: File | null }) => void;
	placeholder?: string;
	disabled?: boolean;
}

const SentientInput = React.memo<SentientInputProps>(({
	onSubmit,
	placeholder = "Describe your symptoms or health concerns...",
	disabled = false
}) => {
	const [text, setText] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
  
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
		}
	}, [text]);

	// Generate image preview
	useEffect(() => {
		if (selectedFile) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				if (result && result.startsWith('data:image/')) {
					setImagePreview(result);
				}
			};
			reader.onerror = () => setImagePreview(null);
			reader.readAsDataURL(selectedFile);
		} else {
			setImagePreview(null);
		}
	}, [selectedFile]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim() && !selectedFile) return;
    
		onSubmit({ text: text.trim(), file: selectedFile });
		setText('');
		setSelectedFile(null);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleFileSelect = (file: File) => {
		if (file.type.startsWith('image/')) {
			setSelectedFile(file);
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleFileSelect(file);
		e.target.value = ''; // Reset for repeated selections
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of Array.from(items)) {
			if (item.type.startsWith('image/')) {
				e.preventDefault();
				const file = item.getAsFile();
				if (file) handleFileSelect(file);
				break;
			}
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		if (!containerRef.current?.contains(e.relatedTarget as Node)) {
			setIsDragOver(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
    
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				handleFileSelect(file);
			}
		}
	};

	const removeImage = () => {
		setSelectedFile(null);
	};

	const canSubmit = (text.trim() || selectedFile) && !disabled;

	return (
		<div className="w-full px-4 md:px-0">
			<form onSubmit={handleSubmit}>
				<motion.div
					ref={containerRef}
					className={`relative bg-[#1e1e1e] md:bg-zinc-900/60 md:backdrop-blur-sm rounded-full md:rounded-2xl border shadow-lg md:shadow-2xl transition-all duration-200 ${
						isDragOver 
							? 'border-white border-dashed bg-white bg-opacity-5' 
							: 'border-white/10 md:border-white/20'
					}`}
					onPaste={handlePaste}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					whileFocus={{ scale: 1.01 }}
					transition={{ duration: 0.2 }}
				>
					{/* Image Preview */}
					{imagePreview && (
						<div className="p-4 pb-2">
							<div className="relative inline-block">
								<img
									src={imagePreview}
									alt="Selected image"
									className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
								/>
								<motion.button
									type="button"
									onClick={removeImage}
									className="absolute -top-2 -right-2 bg-gray-600 hover:bg-gray-700 text-black rounded-full p-1 shadow-lg"
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
								>
									<X size={14} />
								</motion.button>
							</div>
						</div>
					)}

					{/* Drag Overlay */}
					{isDragOver && (
						<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-10 rounded-xl z-10">
							<div className="text-black text-lg font-medium">
								Drop image here
							</div>
						</div>
					)}

					{/* Input Area */}
					<div className="flex items-end p-2 md:p-3 lg:p-4 gap-2 md:gap-3">
						{/* Attachment Button - Inside pill on mobile */}
						<motion.button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="flex-shrink-0 w-9 h-9 md:w-11 md:h-11 bg-transparent md:bg-white hover:bg-zinc-800 md:hover:bg-white text-zinc-400 md:text-white rounded-full flex items-center justify-center transition-colors duration-200 min-h-[36px] md:min-h-[44px]"
							aria-label="Attach an image"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							disabled={disabled}
						>
							<Paperclip size={16} className="md:hidden" />
							<Paperclip size={18} className="hidden md:block" />
						</motion.button>

						{/* Textarea */}
						<textarea
							ref={textareaRef}
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={placeholder}
							aria-label="Message input"
							disabled={disabled}
							className="flex-1 bg-transparent text-black placeholder-zinc-400 resize-none border-0 outline-none font-sans text-sm md:text-base lg:text-lg leading-relaxed min-h-[36px] md:min-h-[44px] max-h-[200px] py-1.5 md:py-2"
							rows={1}
						/>

						{/* Send Button - Circular teal on mobile */}
						<motion.button
							type="submit"
							disabled={!canSubmit}
							className={`flex-shrink-0 w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-200 min-h-[32px] md:min-h-[44px] ${
								canSubmit
									? 'bg-white hover:bg-white text-black'
									: 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
							}`}
							aria-label="Send message"
							whileHover={canSubmit ? { scale: 1.05 } : {}}
							whileTap={canSubmit ? { scale: 0.95 } : {}}
						>
							<Send size={16} className="md:hidden" />
							<Send size={18} className="hidden md:block" />
						</motion.button>
					</div>

					{/* Hidden File Input */}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileInputChange}
						className="hidden"
					/>
				</motion.div>
			</form>
		</div>
	);
});

SentientInput.displayName = 'SentientInput';

export default SentientInput;
