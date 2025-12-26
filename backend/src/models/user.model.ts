import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
    RESIDENT = 'Resident',
    TECHNICIAN = 'Technician',
    ADMIN = 'Admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.RESIDENT,
    })
    role!: UserRole;

    @Column()
    contact_info!: string;

    @Column({ nullable: true })
    password!: string; // Added for authentication

    @Column({ type: 'varchar', length: 50, nullable: true })
    employee_id?: string; // Technician employee ID

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string; // Contact phone number

    @Column({ type: 'varchar', length: 255, nullable: true })
    photo?: string | null; // Profile photo path

    @Column({ default: true })
    verified!: boolean; // For staff verification - Technicians require admin approval

    @CreateDateColumn()
    created_at!: Date;
}
