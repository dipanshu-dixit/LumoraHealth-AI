import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = React.memo(() => {
	return (
		<div className="flex items-start gap-3 mb-6">
			<motion.div 
				className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-1"
				animate={{ scale: [1, 1.05, 1] }}
				transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
			>
				<span className="text-black font-bold text-sm">L</span>
			</motion.div>
			<div className="flex items-center gap-2 mt-2">
				<div className="flex space-x-1">
					{[0, 1, 2].map((index) => (
						<motion.div
							key={index}
							className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.4, 1, 0.4],
							}}
							transition={{
								duration: 1.2,
								repeat: Infinity,
								delay: index * 0.2,
								ease: 'easeInOut',
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
