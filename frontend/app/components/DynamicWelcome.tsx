/**
 * DynamicWelcome - First impression component with generative background
 * 
 * Purpose: Create magical first moment with time-based greeting and nebula animation
 * Usage: Full-screen welcome that transitions to main chat after 4 seconds
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DynamicWelcomeProps {
	onComplete: () => void;
}

const DynamicWelcome = React.memo<DynamicWelcomeProps>(({ onComplete }) => {
	const [greeting, setGreeting] = useState('');

	useEffect(() => {
		// Detect user's local time for personalized greeting
		const now = new Date();
		const hour = now.getHours();
    
		if (hour >= 5 && hour < 12) {
			setGreeting('Good morning.');
		} else if (hour >= 12 && hour < 17) {
			setGreeting('Good afternoon.');
		} else if (hour >= 17 && hour < 21) {
			setGreeting('Good evening.');
		} else {
			setGreeting('Good night.');
		}

		// Auto-transition after 4 seconds
		const timer = setTimeout(onComplete, 4000);
		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<motion.div
			initial={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.8, ease: 'easeInOut' }}
			className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden"
		>
			{/* Generative Nebula Background */}
			<div className="absolute inset-0">
				{/* Swirling nebula dust */}
				<div className="absolute inset-0 opacity-20">
					<div className="nebula-dust nebula-dust-1"></div>
					<div className="nebula-dust nebula-dust-2"></div>
					<div className="nebula-dust nebula-dust-3"></div>
				</div>
        
				{/* Pulsing light points */}
				<div className="absolute inset-0">
					<div className="light-point light-point-1"></div>
					<div className="light-point light-point-2"></div>
					<div className="light-point light-point-3"></div>
					<div className="light-point light-point-4"></div>
					<div className="light-point light-point-5"></div>
				</div>
			</div>

			{/* Welcome Text */}
			<div className="relative z-10 text-center">
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
					className="text-4xl font-serif text-black mb-4 leading-relaxed"
				>
					{greeting}
				</motion.h1>
        
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1.2, delay: 1, ease: 'easeOut' }}
					className="text-2xl font-sans text-gray-400"
				>
					Welcome to Lumora.
				</motion.p>
			</div>

			{/* CSS Animations */}
			<style jsx>{`
				.nebula-dust {
					position: absolute;
					border-radius: 50%;
					background: radial-gradient(circle, rgba(57, 211, 187, 0.3) 0%, transparent 70%);
					filter: blur(40px);
				}
        
				.nebula-dust-1 {
					width: 300px;
					height: 300px;
					top: 20%;
					left: 10%;
					animation: swirl1 20s ease-in-out infinite;
				}
        
				.nebula-dust-2 {
					width: 200px;
					height: 200px;
					top: 60%;
					right: 15%;
					animation: swirl2 25s ease-in-out infinite reverse;
				}
        
				.nebula-dust-3 {
					width: 150px;
					height: 150px;
					bottom: 30%;
					left: 30%;
					animation: swirl3 30s ease-in-out infinite;
				}
        
				.light-point {
					position: absolute;
					width: 4px;
					height: 4px;
					background: #39D3BB;
					border-radius: 50%;
					box-shadow: 0 0 20px rgba(57, 211, 187, 0.8);
				}
        
				.light-point-1 {
					top: 25%;
					left: 20%;
					animation: pulse1 3s ease-in-out infinite;
				}
        
				.light-point-2 {
					top: 40%;
					right: 25%;
					animation: pulse2 4s ease-in-out infinite;
				}
        
				.light-point-3 {
					bottom: 35%;
					left: 15%;
					animation: pulse3 3.5s ease-in-out infinite;
				}
        
				.light-point-4 {
					top: 15%;
					right: 40%;
					animation: pulse1 2.8s ease-in-out infinite;
				}
        
				.light-point-5 {
					bottom: 20%;
					right: 30%;
					animation: pulse2 3.2s ease-in-out infinite;
				}
        
				@keyframes swirl1 {
					0%, 100% { transform: translate(0, 0) rotate(0deg); }
					25% { transform: translate(30px, -20px) rotate(90deg); }
					50% { transform: translate(0, -40px) rotate(180deg); }
					75% { transform: translate(-30px, -20px) rotate(270deg); }
				}
        
				@keyframes swirl2 {
					0%, 100% { transform: translate(0, 0) rotate(0deg); }
					33% { transform: translate(-25px, 35px) rotate(120deg); }
					66% { transform: translate(25px, 35px) rotate(240deg); }
				}
        
				@keyframes swirl3 {
					0%, 100% { transform: translate(0, 0) rotate(0deg); }
					50% { transform: translate(20px, 30px) rotate(180deg); }
				}
        
				@keyframes pulse1 {
					0%, 100% { opacity: 0.3; transform: scale(1); }
					50% { opacity: 1; transform: scale(1.5); }
				}
        
				@keyframes pulse2 {
					0%, 100% { opacity: 0.4; transform: scale(1); }
					50% { opacity: 0.9; transform: scale(1.3); }
				}
        
				@keyframes pulse3 {
					0%, 100% { opacity: 0.2; transform: scale(1); }
					50% { opacity: 0.8; transform: scale(1.4); }
				}
			`}</style>
		</motion.div>
	);
});

DynamicWelcome.displayName = 'DynamicWelcome';

export default DynamicWelcome;
