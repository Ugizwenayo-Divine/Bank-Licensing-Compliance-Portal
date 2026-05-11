import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ADDITIONAL_INFO_REQUESTED = 'ADDITIONAL_INFO_REQUESTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type FinalStatus =
  | ApplicationStatus.APPROVED
  | ApplicationStatus.REJECTED;

export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> =
  {
    [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED],
    [ApplicationStatus.SUBMITTED]: [ApplicationStatus.UNDER_REVIEW],
    [ApplicationStatus.UNDER_REVIEW]: [
      ApplicationStatus.ADDITIONAL_INFO_REQUESTED,
      ApplicationStatus.REVIEWED,
    ],
    [ApplicationStatus.ADDITIONAL_INFO_REQUESTED]: [
      ApplicationStatus.SUBMITTED,
    ],
    [ApplicationStatus.REVIEWED]: [
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED,
    ],
    [ApplicationStatus.APPROVED]: [],
    [ApplicationStatus.REJECTED]: [],
  };

export const FINAL_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
];

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'institution_name', type: 'varchar' })
  institutionName: string;

  @Column({ name: 'institution_type', type: 'varchar' })
  institutionType: string;

  @Column({ name: 'business_description', type: 'text' })
  businessDescription: string;

  @Column({ name: 'registration_number', type: 'varchar', nullable: true })
  registrationNumber: string;

  @Column({ name: 'contact_email', type: 'varchar', nullable: true })
  contactEmail: string;

  @Column({ name: 'contact_phone', type: 'varchar', nullable: true })
  contactPhone: string;

  @Column({ name: 'address', type: 'varchar', nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'applicant_id' })
  applicant: User;

  @Column({ name: 'applicant_id', type: 'varchar' })
  applicantId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User | null;

  @Column({ name: 'reviewer_id', type: 'varchar', nullable: true })
  reviewerId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver: User | null;

  @Column({ name: 'approver_id', type: 'varchar', nullable: true })
  approverId: string | null;

  @Column({ name: 'applicant_comment', type: 'text', nullable: true })
  applicantComment: string | null;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string | null;

  @Column({ name: 'decision_notes', type: 'text', nullable: true })
  decisionNotes: string | null;

  @Column({ name: 'additional_info_request', type: 'text', nullable: true })
  additionalInfoRequest: string | null;

  @VersionColumn({ name: 'version' })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
