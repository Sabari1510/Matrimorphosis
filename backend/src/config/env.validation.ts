/**
 * @fileoverview Environment Variable Validation
 * Validates required environment variables at application startup
 * 
 * @module config/env.validation
 */

interface EnvConfig {
    name: string;
    required: boolean;
    defaultValue?: string;
}

/** List of environment variables to validate */
const envVariables: EnvConfig[] = [
    { name: 'PORT', required: false, defaultValue: '3000' },
    { name: 'JWT_SECRET', required: true },
    { name: 'NODE_ENV', required: false, defaultValue: 'development' },
    { name: 'CORS_ORIGIN', required: false, defaultValue: 'http://localhost:4200' },
    { name: 'DB_HOST', required: false, defaultValue: 'localhost' },
    { name: 'DB_PORT', required: false, defaultValue: '3306' },
    { name: 'DB_USER', required: false, defaultValue: 'root' },
    { name: 'DB_PASSWORD', required: false },
    { name: 'DB_NAME', required: false, defaultValue: 'maintenance_tracker' },
    { name: 'MONGODB_URI', required: false, defaultValue: 'mongodb://localhost:27017/maintenance_tracker' }
];

/**
 * Validates environment variables at startup
 * Sets default values for optional variables if not provided
 * 
 * @throws Error if required environment variable is missing
 */
export const validateEnv = (): void => {
    console.log('🔍 Validating environment variables...');

    const missingRequired: string[] = [];
    const warnings: string[] = [];

    for (const envVar of envVariables) {
        const value = process.env[envVar.name];

        if (!value) {
            if (envVar.required) {
                missingRequired.push(envVar.name);
            } else if (envVar.defaultValue) {
                process.env[envVar.name] = envVar.defaultValue;
                warnings.push(`${envVar.name} not set, using default: ${envVar.defaultValue}`);
            }
        }
    }

    // Log warnings for default values
    if (warnings.length > 0) {
        console.log('⚠️  Using default values for:');
        warnings.forEach(w => console.log(`   - ${w}`));
    }

    // Throw error if required variables are missing
    if (missingRequired.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingRequired.forEach(v => console.error(`   - ${v}`));
        throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
    }

    // Set JWT_SECRET default for development only
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'development') {
        process.env.JWT_SECRET = 'dev-secret-key-change-in-production';
        console.log('⚠️  Using default JWT_SECRET for development');
    }

    console.log('✅ Environment validation passed');
};

export default validateEnv;
