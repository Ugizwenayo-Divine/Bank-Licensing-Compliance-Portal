import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/user.entity';
import {
  Application,
  ApplicationStatus,
} from '../applications/application.entity';
import { AuditLog, AuditAction } from '../audit/audit-log.entity';
import { Document } from '../documents/document.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'bank_licensing',
  entities: [User, Application, AuditLog, Document],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const appRepo = AppDataSource.getRepository(Application);
  const auditRepo = AppDataSource.getRepository(AuditLog);

  const SALT_ROUNDS = 12;

  const usersData = [
    {
      email: 'admin@bnr.rw',
      firstName: 'System',
      lastName: 'Administrator',
      password: 'Admin@1234!',
      role: UserRole.ADMIN,
    },
    {
      email: 'reviewer@bnr.rw',
      firstName: 'Reviewer',
      lastName: 'Administrator',
      password: 'Reviewer@1234!',
      role: UserRole.REVIEWER,
    },
    {
      email: 'approver@bnr.rw',
      firstName: 'Approver',
      lastName: 'Administrator',
      password: 'Approver@1234!',
      role: UserRole.APPROVER,
    },
    {
      email: 'applicant@bank1.com',
      firstName: 'Jane',
      lastName: 'Doe',
      password: 'Applicant@1234!',
      role: UserRole.APPLICANT,
    },
    {
      email: 'applicant@bank2.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'Applicant@1234!',
      role: UserRole.APPLICANT,
    },
  ];

  for (const data of usersData) {
    let user = await userRepo.findOne({ where: { email: data.email } });
    if (!user) {
      user = userRepo.create({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: await bcrypt.hash(data.password, SALT_ROUNDS),
        role: data.role,
      });
      user = await userRepo.save(user);
      console.log(`Created user: ${data.email} (${data.role})`);
    } else {
      console.log(`User already exists: ${data.email}`);
    }
  }

  // ─── Application 1: DRAFT ─────────────────────

  let app1 = await appRepo.findOne({
    where: { institutionName: 'First Bank Ltd' },
  });
  const applicant1 = await userRepo.findOne({
    where: { email: 'applicant@bank1.com' },
  });

  if (!app1) {
    app1 = appRepo.create({
      institutionName: 'First Bank Ltd',
      institutionType: 'Commercial Bank',
      businessDescription:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      registrationNumber: 'RN0123456789',
      contactEmail: 'info@bank1.com',
      contactPhone: '+250780000001',
      address: 'Kigali, Rwanda',
      applicantId: applicant1!.id,
      status: ApplicationStatus.DRAFT,
      applicantComment: 'Please review',
    });
    app1 = await appRepo.save(app1);

    await auditRepo.save(
      auditRepo.create({
        recordId: app1.id,
        actingUserId: applicant1!.id,
        actingUserEmail: applicant1!.email,
        actingUserRole: UserRole.APPLICANT,
        action: AuditAction.APPLICATION_CREATED,
        stateBefore: null,
        stateAfter: { status: ApplicationStatus.DRAFT },
        metadata: { seeded: true },
        ipAddress: '127.0.0.1',
      }),
    );

    console.log(`Created Application 1: ${app1.institutionName} [DRAFT]`);
  } else {
    console.log(`Application 1 already exists`);
  }

  // ─── Application 2: REVIEWED  ──

  const applicant2 = await userRepo.findOne({
    where: { email: 'applicant@bank2.com' },
  });
  const reviewer = await userRepo.findOne({
    where: { email: 'reviewer@bnr.rw' },
  });

  let app2 = await appRepo.findOne({
    where: { institutionName: 'Second Bank Ltd' },
  });

  if (!app2) {
    app2 = appRepo.create({
      institutionName: 'Second Bank Ltd',
      institutionType: 'Commercial Bank',
      businessDescription:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      registrationNumber: 'RN0987654321',
      contactEmail: 'info@bank2.com',
      contactPhone: '+250780000002',
      address: 'Kigali, Rwanda',
      applicantId: applicant2!.id,
      reviewerId: reviewer!.id,
      status: ApplicationStatus.REVIEWED,
      reviewNotes:
        'Application documents are complete and satisfactory. The institution has demonstrated adequate capital requirements and sound governance structure. Recommend for approval.',
    });
    app2 = await appRepo.save(app2);

    const auditEntries = [
      {
        action: AuditAction.APPLICATION_CREATED,
        actingUserId: applicant2!.id,
        actingUserEmail: applicant2!.email,
        actingUserRole: UserRole.APPLICANT,
        stateBefore: null,
        stateAfter: { status: ApplicationStatus.DRAFT },
      },
      {
        action: AuditAction.APPLICATION_SUBMITTED,
        actingUserId: applicant2!.id,
        actingUserEmail: applicant2!.email,
        actingUserRole: UserRole.APPLICANT,
        stateBefore: { status: ApplicationStatus.DRAFT },
        stateAfter: { status: ApplicationStatus.SUBMITTED },
      },
      {
        action: AuditAction.APPLICATION_UNDER_REVIEW,
        actingUserId: reviewer!.id,
        actingUserEmail: reviewer!.email,
        actingUserRole: UserRole.REVIEWER,
        stateBefore: { status: ApplicationStatus.SUBMITTED },
        stateAfter: {
          status: ApplicationStatus.UNDER_REVIEW,
          reviewerId: reviewer!.id,
        },
      },
      {
        action: AuditAction.APPLICATION_REVIEWED,
        actingUserId: reviewer!.id,
        actingUserEmail: reviewer!.email,
        actingUserRole: UserRole.REVIEWER,
        stateBefore: { status: ApplicationStatus.UNDER_REVIEW },
        stateAfter: {
          status: ApplicationStatus.REVIEWED,
          reviewNotes: app2.reviewNotes,
        },
      },
    ];

    for (const entry of auditEntries) {
      await auditRepo.save(
        auditRepo.create({
          recordId: app2.id,
          ...entry,
          metadata: { seeded: true },
          ipAddress: '127.0.0.1',
        }),
      );
    }

    console.log(`Created Application 2: ${app2.institutionName} [REVIEWED]`);
  } else {
    console.log(`Application 2 already exists`);
  }

  console.log('\n Seed complete. Login credentials:');
  console.log('─'.repeat(60));
  for (const data of usersData) {
    console.log(
      `  ${data.role.padEnd(12)} ${data.email.padEnd(35)} ${data.password}`,
    );
  }
  console.log('─'.repeat(60));

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
