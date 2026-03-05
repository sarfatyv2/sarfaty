export type EmailType = 'corporate' | 'free' | 'unknown';

export interface DigitalPresenceDraweeResultProps {
  id: string;
  draweeId: string;
  domain: string | null;
  emailType: EmailType;
  hasDns: boolean;
  hasActiveSite: boolean;
  siteTitle: string | null;
  rawData: Record<string, unknown> | null;
  queriedAt: Date;
}

export class DigitalPresenceDraweeResult {
  readonly id: string;
  readonly draweeId: string;
  readonly domain: string | null;
  readonly emailType: EmailType;
  readonly hasDns: boolean;
  readonly hasActiveSite: boolean;
  readonly siteTitle: string | null;
  readonly rawData: Record<string, unknown> | null;
  readonly queriedAt: Date;

  private constructor(props: DigitalPresenceDraweeResultProps) {
    this.id = props.id;
    this.draweeId = props.draweeId;
    this.domain = props.domain;
    this.emailType = props.emailType;
    this.hasDns = props.hasDns;
    this.hasActiveSite = props.hasActiveSite;
    this.siteTitle = props.siteTitle;
    this.rawData = props.rawData;
    this.queriedAt = props.queriedAt;
  }

  static create(
    props: Omit<DigitalPresenceDraweeResultProps, 'id' | 'queriedAt'> & { id?: string },
  ): DigitalPresenceDraweeResult {
    return new DigitalPresenceDraweeResult({
      ...props,
      id: props.id ?? '',
      queriedAt: new Date(),
    });
  }

  static reconstitute(props: DigitalPresenceDraweeResultProps): DigitalPresenceDraweeResult {
    return new DigitalPresenceDraweeResult(props);
  }
}
