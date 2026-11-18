// Structural metadata only: no row contents, passwords or connection strings.
export async function schemaInventory(sql) {
  return sql.begin('read only', async tx => ({
    columns: await tx`SELECT table_schema,table_name,column_name,ordinal_position,data_type,udt_schema,udt_name,is_nullable,column_default,is_identity,identity_generation,is_generated,generation_expression FROM information_schema.columns WHERE table_schema IN ('public','drizzle') ORDER BY table_schema,table_name,ordinal_position`,
    relations: await tx`SELECT n.nspname AS schema,c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity,coalesce(c.relacl::text,'') AS acl FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','drizzle') AND c.relkind IN ('r','v','m','S','p') ORDER BY 1,2`,
    constraints: await tx`SELECT n.nspname AS schema,c.relname,k.conname,pg_get_constraintdef(k.oid,true) AS definition,k.convalidated FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','drizzle') ORDER BY 1,2,3`,
    indexes: await tx`SELECT schemaname,tablename,indexname,indexdef FROM pg_indexes WHERE schemaname IN ('public','drizzle') ORDER BY 1,2,3`,
    policies: await tx`SELECT schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check FROM pg_policies WHERE schemaname IN ('public','drizzle') ORDER BY 1,2,3`,
    functions: await tx`SELECT n.nspname AS schema,p.proname,pg_get_function_identity_arguments(p.oid) AS arguments,pg_get_functiondef(p.oid) AS definition,p.prosecdef,coalesce(p.proacl::text,'') AS acl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','drizzle') AND p.prokind IN ('f','p') ORDER BY 1,2,3`,
    views: await tx`SELECT schemaname,viewname,definition FROM pg_views WHERE schemaname IN ('public','drizzle') ORDER BY 1,2`,
    triggers: await tx`SELECT n.nspname AS schema,c.relname,t.tgname,pg_get_triggerdef(t.oid,true) AS definition,t.tgenabled FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE NOT t.tgisinternal AND n.nspname IN ('public','drizzle') ORDER BY 1,2,3`,
    defaultGrants: await tx`SELECT r.rolname,n.nspname,d.defaclobjtype,d.defaclacl::text AS acl FROM pg_default_acl d JOIN pg_roles r ON r.oid=d.defaclrole LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace WHERE n.nspname IN ('public','drizzle') OR n.oid IS NULL ORDER BY 1,2,3`,
    migrations: await tx`SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`,
  }));
}
