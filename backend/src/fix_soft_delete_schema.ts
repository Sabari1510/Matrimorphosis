import { AppDataSource } from './config/database';

async function fixSchema() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        const queryRunner = AppDataSource.createQueryRunner();

        // Add is_deleted column
        try {
            await queryRunner.query('ALTER TABLE `requests` ADD `is_deleted` TINYINT NOT NULL DEFAULT 0');
            console.log('Added is_deleted column');
        } catch (e) {
            console.log('is_deleted column might already exist');
        }

        // Add deleted_by_role column
        try {
            await queryRunner.query('ALTER TABLE `requests` ADD `deleted_by_role` VARCHAR(255) NULL');
            console.log('Added deleted_by_role column');
        } catch (e) {
            console.log('deleted_by_role column might already exist');
        }

        await AppDataSource.destroy();
        console.log('Schema update complete');
    } catch (error) {
        console.error('Error updating schema:', error);
    }
}

fixSchema();
