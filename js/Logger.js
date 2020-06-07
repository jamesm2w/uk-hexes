class Logger {
	static log (message) {
		console.log(`Log: ${message}`);
	}
	
	static warn (message) {
		console.warn(`Warn: ${message}`);
	}
	
	static error (message) {
		console.error(`Error: ${message}`); 
	}
}