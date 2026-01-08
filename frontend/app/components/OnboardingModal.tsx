"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
	onComplete: () => void;
}

import { storage, STORAGE_KEYS } from '../../src/lib/storage';

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
	const [step, setStep] = useState(1);
	const [isVisible, setIsVisible] = useState(true);
	const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');

	const content = {
		en: {
			step1: "A quiet space for health concerns.",
			step2: "Your conversations are private and never stored.\nThis session exists only for this moment.",
			step3: {
				title: "Private AI-assisted health conversations.",
				desc: "Describe your symptoms. Get structured guidance. Not a diagnosis.",
				begin: "Begin",
				skip: "Skip"
			}
		},
		hi: {
			step1: "स्वास्थ्य चिंताओं के लिए एक शांत जगह।",
			step2: "आपकी बातचीत निजी है और कभी सेव नहीं होती।\nयह सत्र केवल इस क्षण के लिए मौजूद है।",
			step3: {
				title: "निजी AI-सहायता प्राप्त स्वास्थ्य बातचीत।",
				desc: "अपने लक्षणों का वर्णन करें। संरचित मार्गदर्शन प्राप्त करें। निदान नहीं।",
				begin: "शुरू करें",
				skip: "छोड़ें"
			}
		}
	};

	useEffect(() => {
		if (step === 1) {
			const timer = setTimeout(() => setStep(2), 4000); // Increased from 3000
			return () => clearTimeout(timer);
		} else if (step === 2) {
			const timer = setTimeout(() => setStep(3), 5000); // Increased from 2500 for longer text
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [step]);

	const handleLanguageSelect = (language: 'en' | 'hi') => {
		setSelectedLanguage(language);
		storage.set(STORAGE_KEYS.LANGUAGE, language);
	};

	const handleComplete = () => {
		setIsVisible(false);
		setTimeout(onComplete, 500);
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
					className="fixed inset-0 z-50 flex items-center justify-center"
				>
					{/* Background */}
					<motion.div
						className="absolute inset-0 bg-black"
						transition={{ duration: 2 }}
					/>

					{/* Content */}
					<div className="relative z-10 max-w-2xl mx-auto px-8 text-center">
						<AnimatePresence mode="wait">
							{step === 1 && (
								<motion.div
									key="step1"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 1 }}
								>
									<h1 className="text-4xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent font-light leading-relaxed font-serif tracking-wide">
										{content[selectedLanguage].step1}
									</h1>
								</motion.div>
							)}

							{step === 2 && (
								<motion.div
									key="step2"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.8 }}
								>
									<p className="text-xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent font-light leading-relaxed font-sans whitespace-pre-line">
										{content[selectedLanguage].step2}
									</p>
								</motion.div>
							)}

							{step === 3 && (
								<motion.div
									key="step3"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 1 }}
								>
									<div className="space-y-8">
										<div className="text-center">
											<h2 className="text-3xl font-serif bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent mb-6">
												{content[selectedLanguage].step3.title}
											</h2>
											<p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto">
												{content[selectedLanguage].step3.desc}
											</p>
										</div>
										<motion.button
											onClick={handleComplete}
											className="bg-white hover:bg-zinc-100 text-black px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-300 mx-auto block"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											{content[selectedLanguage].step3.begin}
										</motion.button>
										<motion.button
											onClick={handleComplete}
											className="mt-4 text-gray-400 hover:text-black text-sm transition-colors duration-200"
											whileHover={{ scale: 1.02 }}
										>
											{content[selectedLanguage].step3.skip}
										</motion.button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
