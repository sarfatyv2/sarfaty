"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserFactory = createUserFactory;
exports.createUserWithCollaboratorFactory = createUserWithCollaboratorFactory;
const uuid_1 = require("uuid");
const user_entity_1 = require("../../src/modules/users/domain/user.entity");
function createUserFactory(overrides = {}) {
    const defaults = {
        id: (0, uuid_1.v4)(),
        email: `test-${Date.now()}@sarfaty.com`,
        fullName: 'Test User',
        role: 'employee',
        ...overrides,
    };
    return user_entity_1.User.create(defaults);
}
function createUserWithCollaboratorFactory(overrides = {}) {
    return createUserFactory({
        employmentType: 'clt',
        cpf: '123.456.789-00',
        department: 'Engineering',
        jobTitle: 'Developer',
        ...overrides,
    });
}
//# sourceMappingURL=user.factory.js.map