import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
  BeforeRemove,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum AuditAction {
  APPLICATION_CREATED = 'APPLICATION_CREATED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_UNDER_REVIEW = 'APPLICATION_UNDER_REVIEW',
  APPLICATION_INFO_REQUESTED = 'APPLICATION_INFO_REQUESTED',
  APPLICATION_REVIEWED = 'APPLICATION_REVIEWED',
  APPLICATION_APPROVED = 'APPLICATION_APPROVED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_UPDATED = 'APPLICATION_UPDATED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_LOGIN = 'USER_LOGIN',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'record_id', type: 'varchar' })
  recordId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'acting_user_id' })
  actingUser: User;

  @Column({ name: 'acting_user_id', type: 'varchar', nullable: true })
  actingUserId: string | null;

  @Column({ name: 'acting_user_email', type: 'varchar', nullable: true })
  actingUserEmail: string | null;

  @Column({ name: 'acting_user_role', type: 'varchar', nullable: true })
  actingUserRole: string | null;

  @Column({ name: 'action', type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'state_before', type: 'jsonb', nullable: true })
  stateBefore: Record<string, any> | null;

  @Column({ name: 'state_after', type: 'jsonb', nullable: true })
  stateAfter: Record<string, any> | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @BeforeUpdate()
  preventUpdate() {
    throw new Error('Audit log records are immutable and cannot be modified.');
  }

  @BeforeRemove()
  preventDelete() {
    throw new Error('Audit log records are immutable and cannot be deleted.');
  }
}
