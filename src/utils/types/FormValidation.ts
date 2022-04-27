export interface FormValidation {
    errors: string[];  // Key-Value store
    meta: {
        valid: boolean;
        dirty: boolean;
        touched: boolean;
        pending: boolean;
        initialValue: any;
    },
    setTouched(touched: boolean): void;
    isSubmitting: boolean;
    submitCount: number;
    values: any; // Proxy
}