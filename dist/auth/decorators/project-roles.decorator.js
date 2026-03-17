"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRoles = exports.PROJECT_ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PROJECT_ROLES_KEY = 'projectRoles';
const ProjectRoles = (...roles) => (0, common_1.SetMetadata)(exports.PROJECT_ROLES_KEY, roles);
exports.ProjectRoles = ProjectRoles;
//# sourceMappingURL=project-roles.decorator.js.map