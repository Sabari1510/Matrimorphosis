import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';

export enum RequestStatus {
    NEW = 'New',
    ASSIGNED = 'Assigned',
    IN_PROGRESS = 'In-Progress',
    RESOLVED = 'Resolved',
}

export enum RequestCategory {
    PLUMBING = 'Plumbing',
    ELECTRICAL = 'Electrical',
    PAINTING = 'Painting',
    OTHER = 'Other',
}

@Entity('requests')
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

    @CreateDateColumn()
    created_at!: Date;
}
