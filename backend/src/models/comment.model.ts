import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.model';
import { Request } from './request.model';

/**
 * Comment entity for request communication
 * Allows residents and technicians to communicate about a request
 */
@Entity('comments')
@Index('idx_comment_request', ['request_id'])
@Index('idx_comment_user', ['user_id'])
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    request_id!: number;

    @ManyToOne(() => Request)
    @JoinColumn({ name: 'request_id' })
    request!: Request;

    @Column()
    user_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column('text')
    message!: string;

    @CreateDateColumn()
    created_at!: Date;
}
