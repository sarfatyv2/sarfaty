import { Inject, Injectable } from '@nestjs/common';
import { ENROLLMENT_REPOSITORY, type EnrollmentRepository, type EnrollmentWithCourse } from '../domain/enrollment.repository';

@Injectable()
export class ListMyEnrollmentsUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(collaboratorId: string): Promise<EnrollmentWithCourse[]> {
    return this.enrollmentRepository.findByCollaboratorWithCourse(collaboratorId);
  }
}
