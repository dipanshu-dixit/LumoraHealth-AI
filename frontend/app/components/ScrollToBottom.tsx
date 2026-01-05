import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollToBottomProps {
	isVisible: boolean;
	onClick: () => void;
}

const ScrollToBottom = React.memo<ScrollToBottomProps>(({ isVisible, onClick }) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.button
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					transition={{ duration: 0.2 }}
					onClick={onClick}
					className="fixed bottom-24 right-6 bg-white hover:bg-zinc-100 text-black p-3 rounded-full shadow-lg z-50"
					aria-label="Scroll to bottom"
				>
					<ChevronDown className="w-5 h-5" />
				</motion.button>
			)}
		</AnimatePresence>
	);
});

ScrollToBottom.displayName = 'ScrollToBottom';

export default ScrollToBottom;