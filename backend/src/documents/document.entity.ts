import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Application } from '../applications/application.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_name', type: 'varchar' })
  originalName: string;

  @Column({ name: 'stored_name', type: 'varchar' })
  storedName: string;

  @Column({ name: 'mime_type', type: 'varchar' })
  mimeType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @ManyToOne(() => Application, { nullable: false })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'application_id', type: 'varchar' })
  applicationId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'uploader_id' })
  uploader: User;

  @Column({ name: 'uploader_id', type: 'varchar' })
  uploaderId: string;

  @Column({ name: 'document_group', type: 'varchar' })
  documentGroup: string;

  @Column({ name: 'version', default: 1 })
  version: number;

  @Column({ name: 'is_superseded', type: 'boolean', default: false })
  isSuperseded: boolean;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
