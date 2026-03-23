import { Inject, Injectable } from '@nestjs/common';
import type { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../domain/user.entity';
import { USER_REPOSITORY, type UserRepository } from '../domain/user.repository';
import { LocalAuthAdapter } from '../infra/local-auth.adapter';
import { UserAlreadyExistsException } from '../domain/exceptions/user-already-exists.exception';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly authAdapter: LocalAuthAdapter,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(dto.email);
    }

    const authUserId = await this.authAdapter.createAuthUser(
      dto.email,
      dto.password,
      { full_name: dto.fullName, role: dto.role },
    );

    const user = User.create({
      id: authUserId,
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role,
      phone: dto.phone,
      employmentType: dto.employmentType,
      isInternal: dto.isInternal,
      socialName: dto.socialName,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      maritalStatus: dto.maritalStatus,
      nationality: dto.nationality,
      cpf: dto.cpf,
      rg: dto.rg,
      rgIssuer: dto.rgIssuer,
      voterRegistration: dto.voterRegistration,
      voterZone: dto.voterZone,
      voterSection: dto.voterSection,
      militaryCert: dto.militaryCert,
      addressStreet: dto.addressStreet,
      addressNumber: dto.addressNumber,
      addressComplement: dto.addressComplement,
      addressNeighborhood: dto.addressNeighborhood,
      addressCity: dto.addressCity,
      addressState: dto.addressState,
      addressZip: dto.addressZip,
      personalEmail: dto.personalEmail,
      corporateEmail: dto.corporateEmail,
      extension: dto.extension,
      company: dto.company,
      directorate: dto.directorate,
      department: dto.department,
      branch: dto.branch,
      managerId: dto.managerId,
      jobTitle: dto.jobTitle,
      roleCode: dto.roleCode,
      roleLevel: dto.roleLevel,
      startDateOriginal: dto.startDateOriginal,
      startDateCurrent: dto.startDateCurrent,
      registrationDate: dto.registrationDate,
      registrationNumber: dto.registrationNumber,
      badgeNumber: dto.badgeNumber,
      currentSalary: dto.currentSalary,
      bankName: dto.bankName,
      bankBranch: dto.bankBranch,
      bankAccount: dto.bankAccount,
      bankAccountType: dto.bankAccountType,
      commissionPct: dto.commissionPct,
      guaranteedBonus: dto.guaranteedBonus,
      plrEligible: dto.plrEligible,
      thirteenthPj: dto.thirteenthPj,
      hasMedicalAssistance: dto.hasMedicalAssistance,
      medicalPlanNotes: dto.medicalPlanNotes,
      ctpsNumber: dto.ctpsNumber,
      ctpsSeries: dto.ctpsSeries,
      pisPasep: dto.pisPasep,
      timesheetSystem: dto.timesheetSystem,
      timesheetId: dto.timesheetId,
      companyName: dto.companyName,
      companyCnpj: dto.companyCnpj,
      companyCnae: dto.companyCnae,
      monthlyNfAmount: dto.monthlyNfAmount,
      nfDueDay: dto.nfDueDay,
    });

    if (user.hasCollaboratorData) {
      await this.userRepository.save(user);
    }

    return user;
  }
}
