const { z } = require('zod');

const { USER_ROLES } = require('../utils/userRoles');

const adminUsersQuerySchema = z.object({
  role: z.enum(USER_ROLES).optional()
});

module.exports = {
  adminUsersQuerySchema
};
