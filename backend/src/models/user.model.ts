import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
    RESIDENT = 'Resident',
    TECHNICIAN = 'Technician',
    ADMIN = 'Admin',
}

@Entity('users')
@Index('idx_user_role', ['role'])
@Index('idx_user_verified', ['verified'])
@Index('idx_user_specialization', ['specialization'])
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

    @Column({ unique: true })
    contact_info!: string; // Email - made unique for faster lookups

    @Column({ nullable: true })
    password!: string; // Added for authentication

    @Column({ type: 'varchar', length: 50, nullable: true })
    employee_id?: string; // Technician employee ID

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string; // Contact phone number

    @Column({ type: 'varchar', length: 255, nullable: true })
    photo?: string | null; // Profile photo path

    @Column({ type: 'varchar', length: 50, nullable: true })
    specialization?: string; // Technician specialization: plumbing, electrical, hvac, etc.

    @Column({ default: true })
    verified!: boolean; // For staff verification - Technicians require admin approval

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    password_reset_token?: string | null;

    @Column({ type: 'datetime', nullable: true })
    password_reset_expires?: Date | null;
}

