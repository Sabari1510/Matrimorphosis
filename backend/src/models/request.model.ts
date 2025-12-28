import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.model';

export enum RequestStatus {
    NEW = 'New',
    ASSIGNED = 'Assigned',
    IN_PROGRESS = 'In-Progress',
    RESOLVED = 'Resolved',
}

export enum RequestCategory {
    PLUMBING = 'plumbing',
    ELECTRICAL = 'electrical',
    HVAC = 'hvac',
    APPLIANCE = 'appliance',
    SECURITY = 'security',
    CLEANING = 'cleaning',
    PAINTING = 'painting',
    STRUCTURAL = 'structural',
    OTHER = 'other',
}

@Entity('requests')
@Index('idx_request_status', ['status'])
@Index('idx_request_resident', ['resident_id'])
@Index('idx_request_technician', ['technician_id'])
@Index('idx_request_deleted', ['is_deleted'])
@Index('idx_request_priority', ['priority'])
export class Request {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    resident_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'resident_id' })
    resident!: User;

    @Column({ nullable: true })
    technician_id!: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'technician_id' })
    technician!: User;

    @Column({
        type: 'enum',
        enum: RequestCategory,
    })
    category!: RequestCategory;

    @Column()
    title!: string;

    @Column('text')
    description!: string;

    @Column()
    priority!: string; // low, medium, high, urgent

    @Column()
    location!: string; // Room number, building, etc.

    @Column({ type: 'varchar', length: 255, nullable: true })
    media?: string | null; // URL or File Path

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.NEW,
    })
    status!: RequestStatus;

    @Column({ nullable: true })
    feedback_rating!: number;

    @Column('text', { nullable: true })
    feedback_comments!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    completion_media?: string | null; // Proof of work from technician

    @CreateDateColumn()
    created_at!: Date;

    @Column({ default: false })
    is_deleted!: boolean;

    @Column({ nullable: true })
    deleted_by_role!: string;

    @Column({ type: 'datetime', nullable: true })
    assigned_at?: Date | null; // When technician was assigned (for delay tracking)

    @UpdateDateColumn()
    updated_at!: Date;
}

