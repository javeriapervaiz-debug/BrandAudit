// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Extend Window interface for global variables used in brand audit
	interface Window {
		brandGuideline?: any;
		analysis?: any;
		violations?: any[];
		auditType?: string;
	}
}

export {};