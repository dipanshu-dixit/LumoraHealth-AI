/**
 * DeleteAccountModal - Confirmation modal for account deletion
 * 
 * Purpose: Provide secure confirmation flow for irreversible account deletion
 * Features: Type confirmation, clear warnings, intentional friction
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAccountModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const DeleteAccountModal = React.memo<DeleteAccountModalProps>(({
	isOpen,
	onClose,
	onConfirm
}) => {
	const [confirmText, setConfirmText] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		setIsDeleting(true);
		// Simulate deletion process
		await new Promise(resolve => setTimeout(resolve, 2000));
		onConfirm();
		setIsDeleting(false);
	};

	const canDelete = confirmText === 'DELETE';

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
					onClick={onClose}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className="bg-zinc-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-red-500 border-opacity-30 z-50"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
									<AlertTriangle size={20} className="text-red-400" />
								</div>
								<h3 className="text-xl font-serif text-white">
									Delete Account
								</h3>
							</div>
              
							<button
								onClick={onClose}
								aria-label="Close modal"
								className="text-muted hover:text-starlight transition-colors duration-200"
							>
								<X size={20} />
							</button>
						</div>

						<div className="mb-6">
							<p className="text-white mb-4 leading-relaxed">
								This action is <strong className="text-red-400">irreversible</strong> and will permanently delete all of your consultation history and personal data.
							</p>
              
							<p className="text-gray-300 text-sm mb-4">
								All your conversations, health data, and account information will be permanently removed from our servers.
							</p>

							<div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4 mb-4">
								<p className="text-red-400 text-sm font-medium">
									⚠️ This cannot be undone. Your data will be lost forever.
								</p>
							</div>
						</div>

						<div className="mb-6">
							<label className="block text-white text-sm font-medium mb-2">
								Type <span className="text-red-400 font-bold">DELETE</span> to confirm:
							</label>
							<input
								type="text"
								value={confirmText}
								onChange={(e) => setConfirmText(e.target.value)}
								placeholder="Type DELETE here"
								className="w-full bg-zinc-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
								disabled={isDeleting}
							/>
						</div>

						<div className="flex space-x-3">
							<motion.button
								onClick={onClose}
								disabled={isDeleting}
								className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
								whileHover={!isDeleting ? { scale: 1.02 } : {}}
								whileTap={!isDeleting ? { scale: 0.98 } : {}}
							>
								Cancel
							</motion.button>
              
							<motion.button
								onClick={handleConfirm}
								disabled={!canDelete || isDeleting}
								className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
									canDelete && !isDeleting
										? 'bg-red-600 hover:bg-red-700 text-white'
										: 'bg-gray-600 text-gray-400 cursor-not-allowed'
								}`}
								whileHover={canDelete && !isDeleting ? { scale: 1.02 } : {}}
								whileTap={canDelete && !isDeleting ? { scale: 0.98 } : {}}
							>
								{isDeleting ? 'Deleting...' : 'Delete Account'}
							</motion.button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
});

DeleteAccountModal.displayName = 'DeleteAccountModal';

export default DeleteAccountModal;
