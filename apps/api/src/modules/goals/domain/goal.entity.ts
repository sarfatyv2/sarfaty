import type { GoalLevel } from '@nexus/types';

export interface GoalProps {
  id: string;
  profileId: string | null;
  teamId: string | null;
  regionId: string | null;
  periodYear: number;
  periodMonth: number;
  goalAmount: string;
  goalCount: number | null;
  achievedAmount: string;
  achievedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Goal {
  readonly id: string;
  readonly profileId: string | null;
  readonly teamId: string | null;
  readonly regionId: string | null;
  readonly periodYear: number;
  readonly periodMonth: number;
  readonly goalAmount: string;
  readonly goalCount: number | null;
  readonly achievedAmount: string;
  readonly achievedCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: GoalProps) {
    this.id = props.id;
    this.profileId = props.profileId;
    this.teamId = props.teamId;
    this.regionId = props.regionId;
    this.periodYear = props.periodYear;
    this.periodMonth = props.periodMonth;
    this.goalAmount = props.goalAmount;
    this.goalCount = props.goalCount;
    this.achievedAmount = props.achievedAmount;
    this.achievedCount = props.achievedCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<GoalProps, 'id' | 'achievedAmount' | 'achievedCount' | 'createdAt' | 'updatedAt'>): Goal {
    Goal.validateAmount(props.goalAmount);
    Goal.validatePeriod(props.periodYear, props.periodMonth);
    Goal.validateOwnership(props.profileId, props.teamId, props.regionId);

    return new Goal({
      ...props,
      id: '',
      achievedAmount: '0',
      achievedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: GoalProps): Goal {
    return new Goal(props);
  }

  get level(): GoalLevel {
    if (this.profileId) return 'individual';
    if (this.teamId) return 'team';
    return 'region';
  }

  progressPercentage(): number {
    const achieved = parseFloat(this.achievedAmount);
    const target = parseFloat(this.goalAmount);
    if (target <= 0) return 0;
    return Math.min(Math.round((achieved / target) * 100), 100);
  }

  isAchieved(): boolean {
    return parseFloat(this.achievedAmount) >= parseFloat(this.goalAmount);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      profileId: this.profileId,
      teamId: this.teamId,
      regionId: this.regionId,
      level: this.level,
      periodYear: this.periodYear,
      periodMonth: this.periodMonth,
      goalAmount: this.goalAmount,
      goalCount: this.goalCount,
      achievedAmount: this.achievedAmount,
      achievedCount: this.achievedCount,
      progressPct: this.progressPercentage(),
      isAchieved: this.isAchieved(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  private static validateAmount(amount: string): void {
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
      throw new Error('Goal amount must be a positive number');
    }
  }

  private static validatePeriod(year: number, month: number): void {
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }
    if (year < 2024 || year > 2100) {
      throw new Error('Year must be between 2024 and 2100');
    }
  }

  private static validateOwnership(
    profileId: string | null,
    teamId: string | null,
    regionId: string | null,
  ): void {
    const count = [profileId, teamId, regionId].filter(Boolean).length;
    if (count !== 1) {
      throw new Error('Exactly one of profileId, teamId, or regionId must be set');
    }
  }
}
