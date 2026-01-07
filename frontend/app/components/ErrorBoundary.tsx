"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	retryCount: number;
	isRetrying: boolean;
}

class ErrorBoundary extends Component<Props, State> {
	private retryTimeouts: NodeJS.Timeout[] = [];
	private maxRetries = 5;

	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			retryCount: 0,
			isRetrying: false
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return {
			hasError: true,
			error
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({
			error,
			errorInfo
		});

		console.error('ErrorBoundary caught an error:', error);
	}

	handleRetry = () => {
		if (this.state.retryCount >= this.maxRetries) {
			this.showToast('Maximum retry attempts reached', 'error');
			return;
		}

		this.setState({ isRetrying: true });

		// Exponential backoff: 1s, 2s, 4s, 8s, 16s
		const delay = Math.pow(2, this.state.retryCount) * 1000;
    
		const timeout = setTimeout(() => {
			this.setState({
				hasError: false,
				error: null,
				errorInfo: null,
				retryCount: this.state.retryCount + 1,
				isRetrying: false
			});
		}, delay);

		this.retryTimeouts.push(timeout);
	};

	handleReportBug = () => {
		this.showToast('Issue reported', 'success');
	};

	showToast = (message: string, type: 'success' | 'error') => {
		const toast = document.createElement('div');
		toast.style.cssText = `
			position: fixed; top: 80px; right: 20px; z-index: 10000;
			padding: 12px 16px; border-radius: 8px; color: white;
			font-size: 14px; font-weight: 500;
			background: ${type === 'success' ? '#10b981' : '#ef4444'};
			transform: translateX(100%); transition: transform 0.3s ease;
		`;
		toast.textContent = message;
		document.body.appendChild(toast);
		setTimeout(() => toast.style.transform = 'translateX(0)', 100);
		setTimeout(() => {
			toast.style.transform = 'translateX(100%)';
			setTimeout(() => toast.remove(), 300);
		}, 4000);
	};

	componentWillUnmount() {
		this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
	}

	render() {
		if (this.state.hasError) {
			const { error, retryCount, isRetrying } = this.state;
			const canRetry = retryCount < this.maxRetries;

			return (
				<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
					<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
						<div className="mb-6">
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">⚠️</span>
							</div>
							<h2 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
								Consultation Temporarily Unavailable
							</h2>
							<p className="text-gray-600 text-sm mb-4">
								We&apos;re experiencing a technical issue. Our support team has been notified and is working to resolve this.
							</p>
						</div>

						{error && (
							<div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
								<h3 className="font-medium text-sm mb-2" style={{ color: '#000' }}>
									Error Details:
								</h3>
								<code className="text-xs text-red-600 break-all">
									{error.message}
								</code>
							</div>
						)}

						<div className="space-y-3">
							{canRetry && (
								<button
									onClick={this.handleRetry}
									disabled={isRetrying}
									className="w-full py-3 px-4 bg-blue-600 text-black rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									style={{ backgroundColor: '#007bff' }}
								>
									{isRetrying ? (
										<span className="flex items-center justify-center">
											<span className="animate-spin mr-2">⟳</span>
											Retrying... ({Math.pow(2, retryCount)}s)
										</span>
									) : (
										`Retry (${retryCount + 1}/${this.maxRetries})`
									)}
								</button>
							)}

							<a
								href="mailto:dipanshudixit206@gmail.com?subject=Lumora Error Report&body=Hi Dipanshu,%0D%0A%0D%0AI encountered an error in Lumora:%0D%0A%0D%0AError: {error?.message || 'Unknown error'}%0D%0A%0D%0APlease help me resolve this issue."
								className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors block text-center"
								style={{ color: '#666' }}
							>
								Contact Support
							</a>

							<button
								onClick={() => window.location.reload()}
								className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
								style={{ color: '#666' }}
							>
								Reload Page
							</button>
						</div>

					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
