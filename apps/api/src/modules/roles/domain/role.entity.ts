export class RoleEntity {
  readonly id: string;
  readonly key: string;
  label: string;
  homeRoute: string;
  readonly isSystem: boolean;
  isActive: boolean;
  readonly createdAt: Date;
  updatedAt: Date;
  features: string[];

  constructor(props: {
    id: string;
    key: string;
    label: string;
    homeRoute: string;
    isSystem: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    features?: string[];
  }) {
    this.id = props.id;
    this.key = props.key;
    this.label = props.label;
    this.homeRoute = props.homeRoute;
    this.isSystem = props.isSystem;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.features = props.features ?? [];
  }

  updateLabel(label: string): void {
    this.label = label;
    this.updatedAt = new Date();
  }

  updateHomeRoute(homeRoute: string): void {
    this.homeRoute = homeRoute;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  setFeatures(featureKeys: string[]): void {
    this.features = [...new Set(featureKeys)];
    this.updatedAt = new Date();
  }
}
