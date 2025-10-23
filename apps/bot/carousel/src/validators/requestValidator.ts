export interface ValidationError {
	field: string;
	message: string;
}

export class RequestValidator {
	static validateAskRequest(body: any): ValidationError[] {
		const errors: ValidationError[] = [];
		
		if (!body.input && !body.messages && !body.audio) {
			errors.push({
				field: 'input',
				message: 'Provide input, messages, or audio'
			});
		}
		
		if (body.audio && !body.audioFormat) {
			errors.push({
				field: 'audioFormat',
				message: 'audioFormat is required when audio is provided'
			});
		}
		
		return errors;
	}
	
	static validateFileUpload(file: File): ValidationError[] {
		const errors: ValidationError[] = [];
		
		if (!file) {
			errors.push({
				field: 'file',
				message: 'No file provided'
			});
			return errors;
		}
		
		// Check file size (10MB limit)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			errors.push({
				field: 'file',
				message: 'File size exceeds 10MB limit'
			});
		}
		
		// Check file type
		const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg'];
		if (!allowedTypes.includes(file.type)) {
			errors.push({
				field: 'file',
				message: 'Unsupported file type. Allowed: mp3, wav, m4a, webm, ogg'
			});
		}
		
		return errors;
	}
}
