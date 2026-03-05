export class DraweeCreatedEvent {
  static readonly EVENT_NAME = 'drawee.created';

  constructor(public readonly draweeId: string) {}
}
