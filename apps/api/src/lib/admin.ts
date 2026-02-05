const parseAdminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  const admins = parseAdminEmails();
  return admins.includes(email.toLowerCase());
};
