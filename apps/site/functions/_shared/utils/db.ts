export const isPostgres = (): boolean => {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf('postgresql://') !== -1);
}