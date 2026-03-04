export type EmailType = 'corporate' | 'free' | 'unknown';

export interface DigitalPresenceResultProps {
  id: string;
  clientId: string;
  domain: string | null;
  emailType: EmailType;
  hasDns: boolean;
  hasActiveSite: boolean;
  siteTitle: string | null;
  rawData: Record<string, unknown> | null;
  queriedAt: Date;
}

export class DigitalPresenceResult {
  readonly id: string;
  readonly clientId: string;
  readonly domain: string | null;
  readonly emailType: EmailType;
  readonly hasDns: boolean;
  readonly hasActiveSite: boolean;
  readonly siteTitle: string | null;
  readonly rawData: Record<string, unknown> | null;
  readonly queriedAt: Date;

  private constructor(props: DigitalPresenceResultProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.domain = props.domain;
    this.emailType = props.emailType;
    this.hasDns = props.hasDns;
    this.hasActiveSite = props.hasActiveSite;
    this.siteTitle = props.siteTitle;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(props: Omit<DigitalPresenceResultProps, 'id' | 'queriedAt'> & { id?: string }): DigitalPresenceResult {
    return new DigitalPresenceResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: DigitalPresenceResultProps): DigitalPresenceResult {
    return new DigitalPresenceResult(props);
  }
}
