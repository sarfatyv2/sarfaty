import { ClientContact, type ClientContactProps } from '../../domain/client-contact.entity';
import type { clientContacts } from '../../../../database/schema';

type Row = typeof clientContacts.$inferSelect;

export class ClientContactMapper {
  static toDomain(row: Row): ClientContact {
    const props: ClientContactProps = {
      id: row.id,
      clientId: row.clientId,
      contactName: row.contactName,
      useType: row.useType,
      email: row.email,
      emailSecondary: row.emailSecondary,
      phone: row.phone,
      phoneMobile: row.phoneMobile,
      phoneSms: row.phoneSms,
      whatsapp: row.whatsapp ?? false,
      homepage: row.homepage,
      notes: row.notes,
      isPrimary: row.isPrimary ?? false,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return ClientContact.reconstitute(props);
  }

  static toPersistence(contact: ClientContact): Record<string, unknown> {
    return {
      clientId: contact.clientId,
      contactName: contact.contactName,
      useType: contact.useType,
      email: contact.email,
      emailSecondary: contact.emailSecondary,
      phone: contact.phone,
      phoneMobile: contact.phoneMobile,
      phoneSms: contact.phoneSms,
      whatsapp: contact.whatsapp,
      homepage: contact.homepage,
      notes: contact.notes,
      isPrimary: contact.isPrimary,
      isActive: contact.isActive,
    };
  }
}
