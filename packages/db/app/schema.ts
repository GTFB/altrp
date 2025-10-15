import { relations, sql, InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex, check } from 'drizzle-orm/sqlite-core';

// Helpers
const nowUnix = sql`unixepoch('now')`;

// Taxonomy (universal dictionary)
export const taxonomy = sqliteTable(
  'taxonomy',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    entity: text('entity').notNull(),
    name: text('name').notNull(),
    title: text('title'),
    order: integer('order').default(0),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
  },
  (t) => ({
    entityNameUnique: uniqueIndex('ux_taxonomy_entity_name').on(t.entity, t.name),
    entityIdx: index('ix_taxonomy_entity').on(t.entity),
    nameIdx: index('ix_taxonomy_name').on(t.name),
  }),
);

export type Taxonomy = InferSelectModel<typeof taxonomy>;
export type NewTaxonomy = InferInsertModel<typeof taxonomy>;

// Permission
export const permissions = sqliteTable(
  'permissions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    order: integer('order').default(0),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
  },
  (t) => ({
    codeUx: uniqueIndex('ux_permissions_code').on(t.code),
  }),
);

export type Permission = InferSelectModel<typeof permissions>;
export type NewPermission = InferInsertModel<typeof permissions>;

// Human
export const humans = sqliteTable(
  'humans',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    haid: text('haid').notNull(),
    full_name: text('full_name').notNull(),
    birthday: text('birthday'),
    email: text('email'),
    status_name: text('status_name'), // Taxonomy
    type: text('type'), // Taxonomy
    city_name: text('city_name'), // Taxonomy
    order: integer('order').default(0),
    xaid: text('xaid'),
    media_id: integer('media_id'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_humans_uuid').on(t.uuid),
    haidUx: uniqueIndex('ux_humans_haid').on(t.haid),
    emailIdx: index('ix_humans_email').on(t.email),
    dataInJson: check('ck_humans_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_humans_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

export type Human = InferSelectModel<typeof humans>;
export type NewHuman = InferInsertModel<typeof humans>;

// Contractor
export const contractors = sqliteTable(
  'contractors',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    caid: text('caid').notNull(),
    title: text('title').notNull(),
    reg: text('reg'),
    tin: text('tin'),
    status_name: text('status_name'), // Taxonomy
    type: text('type'), // Taxonomy
    city_name: text('city_name'), // Taxonomy
    order: integer('order').default(0),
    xaid: text('xaid'),
    media_id: integer('media_id'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_contractors_uuid').on(t.uuid),
    caidUx: uniqueIndex('ux_contractors_caid').on(t.caid),
    tinIdx: index('ix_contractors_tin').on(t.tin),
    dataInJson: check('ck_contractors_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_contractors_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

export type Contractor = InferSelectModel<typeof contractors>;
export type NewContractor = InferInsertModel<typeof contractors>;

// Media
export const media = sqliteTable(
  'media',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    maid: text('maid'),
    title: text('title'), // json
    alt_text: text('alt_text'), // json
    caption: text('caption'), // json
    file_name: text('file_name'),
    file_path: text('file_path'),
    mime_type: text('mime_type'),
    size_bytes: integer('size_bytes'),
    is_public: integer('is_public', { mode: 'boolean' }).default(true),
    type: text('type'), // Taxonomy
    uploader_aid: text('uploader_aid'), // FK → humans.haid (policy to be confirmed)
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    data_in: text('data_in'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_media_uuid').on(t.uuid),
    maidUx: uniqueIndex('ux_media_maid').on(t.maid),
    uploaderIdx: index('ix_media_uploader_aid').on(t.uploader_aid),
    titleJson: check('ck_media_title_json', sql`json_valid(${t.title})`),
    altTextJson: check('ck_media_alt_text_json', sql`json_valid(${t.alt_text})`),
    captionJson: check('ck_media_caption_json', sql`json_valid(${t.caption})`),
    dataInJson: check('ck_media_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(humans, {
    fields: [media.uploader_aid],
    references: [humans.haid],
  }),
}));

export type Media = InferSelectModel<typeof media>;
export type NewMedia = InferInsertModel<typeof media>;

// Keys (API keys)
export const keys = sqliteTable(
  'keys',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    kaid: text('kaid').notNull(),
    key_prefix: text('key_prefix'),
    key_hash: text('key_hash').notNull(),
    title: text('title'),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    order: integer('order').default(0),
    xaid: text('xaid'),
    permission_id: integer('permission_id'), // FK → permissions.id (policy to be confirmed)
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    data_in: text('data_in'),
  },
  (t) => ({
    kaidUx: uniqueIndex('ux_keys_kaid').on(t.kaid),
    keyHashUx: uniqueIndex('ux_keys_key_hash').on(t.key_hash),
    permissionIdx: index('ix_keys_permission_id').on(t.permission_id),
    dataInJson: check('ck_keys_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

export const keysRelations = relations(keys, ({ one }) => ({
  permission: one(permissions, {
    fields: [keys.permission_id],
    references: [permissions.id],
  }),
}));

export type Key = InferSelectModel<typeof keys>;
export type NewKey = InferInsertModel<typeof keys>;

// Asset
export const assets = sqliteTable(
  'assets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    aaid: text('aaid').notNull(),
    owner_aid: text('owner_aid'), // polymorphic: humans.haid or contractors.caid (no FK)
    number: text('number'),
    title: text('title'),
    url: text('url'),
    type_name: text('type_name'), // Taxonomy
    status_name: text('status_name'), // Taxonomy
    version: text('version'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_assets_uuid').on(t.uuid),
    aaidUx: uniqueIndex('ux_assets_aaid').on(t.aaid),
    ownerIdx: index('ix_assets_owner_aid').on(t.owner_aid),
    dataInJson: check('ck_assets_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_assets_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

export type Asset = InferSelectModel<typeof assets>;
export type NewAsset = InferInsertModel<typeof assets>;

// Asset Variant
export const asset_variants = sqliteTable(
  'asset_variants',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    full_aaid: text('full_aaid').notNull(),
    number: text('number'),
    title: text('title'),
    media_id: integer('media_id'),
    version: text('version'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_asset_variants_uuid').on(t.uuid),
    fullAaidIdx: index('ix_asset_variants_full_aaid').on(t.full_aaid),
    dataInJson: check('ck_asset_variants_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_asset_variants_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Base
export const bases = sqliteTable(
  'bases',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    baid: text('baid').notNull(),
    number: text('number'),
    title: text('title'),
    laid_from: text('laid_from'),
    laid_to: text('laid_to'),
    cycle: text('cycle'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_bases_uuid').on(t.uuid),
    baidUx: uniqueIndex('ux_bases_baid').on(t.baid),
    laidFromIdx: index('ix_bases_laid_from').on(t.laid_from),
    laidToIdx: index('ix_bases_laid_to').on(t.laid_to),
    cycleJson: check('ck_bases_cycle_json', sql`json_valid(${t.cycle})`),
    dataInJson: check('ck_bases_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_bases_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Base Move
export const base_moves = sqliteTable(
  'base_moves',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    baid: text('baid'),
    full_baid: text('full_baid'),
    full_daid: text('full_daid'),
    number: text('number'),
    title: text('title'),
    laid_from: text('laid_from'),
    laid_to: text('laid_to'),
    cycle: text('cycle'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_base_moves_uuid').on(t.uuid),
    fullBaidIdx: index('ix_base_moves_full_baid').on(t.full_baid),
    fullDaidIdx: index('ix_base_moves_full_daid').on(t.full_daid),
    cycleJson: check('ck_base_moves_cycle_json', sql`json_valid(${t.cycle})`),
    dataInJson: check('ck_base_moves_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_base_moves_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Base Move Rout
export const base_move_routes = sqliteTable(
  'base_move_routes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    full_baid: text('full_baid').notNull(),
    index: text('index'),
    city: text('city'),
    laid_id: text('laid_id'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    data_in: text('data_in'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_base_move_routes_uuid').on(t.uuid),
    fullBaidIdx: index('ix_base_move_routes_full_baid').on(t.full_baid),
    dataInJson: check('ck_base_move_routes_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Deal
export const deals = sqliteTable(
  'deals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    daid: text('daid').notNull(),
    full_daid: text('full_daid'),
    client_aid: text('client_aid'),
    title: text('title'),
    cycle: text('cycle'),
    status_name: text('status_name'),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_deals_uuid').on(t.uuid),
    daidUx: uniqueIndex('ux_deals_daid').on(t.daid),
    clientIdx: index('ix_deals_client_aid').on(t.client_aid),
    cycleJson: check('ck_deals_cycle_json', sql`json_valid(${t.cycle})`),
    ginJson: check('ck_deals_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_deals_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_deals_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Deal Product (many-to-many)
export const deal_products = sqliteTable(
  'deal_products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    full_daid: text('full_daid').notNull(),
    full_paid: text('full_paid').notNull(),
    quantity: integer('quantity').notNull().default(1),
    status_name: text('status_name'),
    order: integer('order').default(0),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    data_in: text('data_in'),
  },
  (t) => ({
    fullDaidIdx: index('ix_deal_products_full_daid').on(t.full_daid),
    fullPaidIdx: index('ix_deal_products_full_paid').on(t.full_paid),
    dataInJson: check('ck_deal_products_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Echelon (organization positions)
export const echelons = sqliteTable(
  'echelons',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    eaid: text('eaid').notNull(),
    parent_eaid: text('parent_eaid'),
    department_id: text('department_id'),
    position: text('position'),
    city_name: text('city_name'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    data_in: text('data_in'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_echelons_uuid').on(t.uuid),
    eaidUx: uniqueIndex('ux_echelons_eaid').on(t.eaid),
    parentIdx: index('ix_echelons_parent_eaid').on(t.parent_eaid),
    dataInJson: check('ck_echelons_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Echelon Employee
export const echelon_employees = sqliteTable(
  'echelon_employees',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    eaid: text('eaid').notNull(),
    full_eaid: text('full_eaid'),
    haid: text('haid').notNull(),
    email: text('email'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    media_id: integer('media_id'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_echelon_employees_uuid').on(t.uuid),
    haidIdx: index('ix_echelon_employees_haid').on(t.haid),
    eaidIdx: index('ix_echelon_employees_eaid').on(t.eaid),
    ginJson: check('ck_echelon_employees_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_echelon_employees_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_echelon_employees_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Employee Timesheet
export const employee_timesheets = sqliteTable(
  'employee_timesheets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    etaid: text('etaid'),
    full_eaid: text('full_eaid'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    started_at: text('started_at'),
    ended_at: text('ended_at'),
    duration: integer('duration'),
    data_in: text('data_in'),
  },
  (t) => ({
    fullEaidIdx: index('ix_employee_timesheets_full_eaid').on(t.full_eaid),
    dataInJson: check('ck_employee_timesheets_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Employee Leave
export const employee_leaves = sqliteTable(
  'employee_leaves',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    elaid: text('elaid'),
    full_eaid: text('full_eaid'),
    type: text('type'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    started_at: text('started_at'),
    ended_at: text('ended_at'),
    duration: integer('duration'),
    data_in: text('data_in'),
  },
  (t) => ({
    fullEaidIdx: index('ix_employee_leaves_full_eaid').on(t.full_eaid),
    dataInJson: check('ck_employee_leaves_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Finance
export const finances = sqliteTable(
  'finances',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    faid: text('faid').notNull(),
    full_daid: text('full_daid'),
    title: text('title'),
    sum: integer('sum'),
    currency_id: text('currency_id'),
    cycle: text('cycle'),
    type: text('type'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_finances_uuid').on(t.uuid),
    faidUx: uniqueIndex('ux_finances_faid').on(t.faid),
    fullDaidIdx: index('ix_finances_full_daid').on(t.full_daid),
    cycleJson: check('ck_finances_cycle_json', sql`json_valid(${t.cycle})`),
    ginJson: check('ck_finances_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_finances_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_finances_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Goal
export const goals = sqliteTable(
  'goals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    gaid: text('gaid').notNull(),
    full_gaid: text('full_gaid'),
    parent_full_gaid: text('parent_full_gaid'),
    title: text('title'),
    cycle: text('cycle'),
    type: text('type'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_goals_uuid').on(t.uuid),
    gaidUx: uniqueIndex('ux_goals_gaid').on(t.gaid),
    parentIdx: index('ix_goals_parent_full_gaid').on(t.parent_full_gaid),
    cycleJson: check('ck_goals_cycle_json', sql`json_valid(${t.cycle})`),
    ginJson: check('ck_goals_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_goals_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_goals_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Identity (ACL rule)
export const identities = sqliteTable(
  'identities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    iaid: text('iaid').notNull(),
    entity_aid: text('entity_aid').notNull(),
    identity_aid: text('identity_aid').notNull(),
    permission_id: integer('permission_id'),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    data_in: text('data_in'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_identities_uuid').on(t.uuid),
    entityIdx: index('ix_identities_entity_aid').on(t.entity_aid),
    identityIdx: index('ix_identities_identity_aid').on(t.identity_aid),
    permissionIdx: index('ix_identities_permission_id').on(t.permission_id),
    dataInJson: check('ck_identities_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

export const identitiesRelations = relations(identities, ({ one }) => ({
  permission: one(permissions, {
    fields: [identities.permission_id],
    references: [permissions.id],
  }),
}));

// Journal
export const journals = sqliteTable(
  'journals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    user_id: integer('user_id'),
    action: text('action'),
    details: text('details'),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
  },
  (t) => ({
    userIdx: index('ix_journals_user_id').on(t.user_id),
    detailsJson: check('ck_journals_details_json', sql`json_valid(${t.details})`),
  }),
);

// Journal Connection
export const journal_connections = sqliteTable(
  'journal_connections',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    source_user_id: integer('source_user_id'),
    target_user_id: integer('target_user_id'),
    relationship_name: text('relationship_name'),
    status: text('status'),
    details: text('details'),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
  (t) => ({
    sourceIdx: index('ix_journal_connections_source').on(t.source_user_id),
    targetIdx: index('ix_journal_connections_target').on(t.target_user_id),
    detailsJson: check('ck_journal_connections_details_json', sql`json_valid(${t.details})`),
  }),
);

// Journal Generation
export const journal_generations = sqliteTable(
  'journal_generations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    full_maid: text('full_maid'),
    user_id: integer('user_id'),
    model_name: text('model_name'),
    status: text('status'),
    token_in: integer('token_in'),
    token_out: integer('token_out'),
    total_token: integer('total_token'),
    details: text('details'),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
  },
  (t) => ({
    userIdx: index('ix_journal_generations_user_id').on(t.user_id),
    detailsJson: check('ck_journal_generations_details_json', sql`json_valid(${t.details})`),
  }),
);

// Journal System
export const journal_system = sqliteTable(
  'journal_system',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    entity_aid: text('entity_aid'),
    user_id: integer('user_id'),
    details: text('details'),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
  },
  (t) => ({
    entityIdx: index('ix_journal_system_entity').on(t.entity_aid),
    userIdx: index('ix_journal_system_user').on(t.user_id),
    detailsJson: check('ck_journal_system_details_json', sql`json_valid(${t.details})`),
  }),
);

// Location
export const locations = sqliteTable(
  'locations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    laid: text('laid').notNull(),
    full_laid: text('full_laid'),
    title: text('title'),
    city: text('city'),
    type: text('type'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_locations_uuid').on(t.uuid),
    laidUx: uniqueIndex('ux_locations_laid').on(t.laid),
    parentIdx: index('ix_locations_full_laid').on(t.full_laid),
    ginJson: check('ck_locations_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_locations_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_locations_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Message
export const messages = sqliteTable(
  'messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    maid: text('maid').notNull(),
    full_maid: text('full_maid'),
    title: text('title'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_messages_uuid').on(t.uuid),
    maidUx: uniqueIndex('ux_messages_maid').on(t.maid),
    dataInJson: check('ck_messages_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Message Thread
export const message_threads = sqliteTable(
  'message_threads',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    maid: text('maid').notNull(),
    parent_maid: text('parent_maid'),
    title: text('title'),
    status_name: text('status_name'),
    type: text('type'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    data_in: text('data_in'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_message_threads_uuid').on(t.uuid),
    maidUx: uniqueIndex('ux_message_threads_maid').on(t.maid),
    parentIdx: index('ix_message_threads_parent').on(t.parent_maid),
    ginJson: check('ck_message_threads_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_message_threads_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Notice
export const notices = sqliteTable(
  'notices',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    naid: text('naid'),
    target_aid: text('target_aid'),
    title: text('title'),
    is_read: integer('is_read', { mode: 'boolean' }).default(false),
    type_name: text('type_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    data_in: text('data_in'),
  },
  (t) => ({
    targetIdx: index('ix_notices_target_aid').on(t.target_aid),
    dataInJson: check('ck_notices_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Outreach
export const outreaches = sqliteTable(
  'outreaches',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    oaid: text('oaid').notNull(),
    said: text('said'),
    title: text('title'),
    strategy_type: text('strategy_type'),
    mechanic_type: text('mechanic_type'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_outreaches_uuid').on(t.uuid),
    oaidUx: uniqueIndex('ux_outreaches_oaid').on(t.oaid),
    saidIdx: index('ix_outreaches_said').on(t.said),
    ginJson: check('ck_outreaches_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_outreaches_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_outreaches_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Outreach Referral
export const outreach_referrals = sqliteTable(
  'outreach_referrals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    oaid: text('oaid').notNull(),
    title: text('title'),
    depth: integer('depth').default(0),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    data_in: text('data_in'),
  },
  (t) => ({
    oaidIdx: index('ix_outreach_referrals_oaid').on(t.oaid),
    ginJson: check('ck_outreach_referrals_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_outreach_referrals_data_in_json', sql`json_valid(${t.data_in})`),
  }),
);

// Product
export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    paid: text('paid').notNull(),
    title: text('title'),
    category: text('category'),
    type: text('type'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_products_uuid').on(t.uuid),
    paidUx: uniqueIndex('ux_products_paid').on(t.paid),
    dataInJson: check('ck_products_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_products_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Product Variant
export const product_variants = sqliteTable(
  'product_variants',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid').notNull(),
    pvaid: text('pvaid').notNull(),
    full_paid: text('full_paid').notNull(),
    vendor_aid: text('vendor_aid'), // Contractor.caid
    sku: text('sku'),
    title: text('title'),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    uuidUx: uniqueIndex('ux_product_variants_uuid').on(t.uuid),
    pvaidUx: uniqueIndex('ux_product_variants_pvaid').on(t.pvaid),
    vendorIdx: index('ix_product_variants_vendor_aid').on(t.vendor_aid),
    fullPaidIdx: index('ix_product_variants_full_paid').on(t.full_paid),
    dataInJson: check('ck_product_variants_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_product_variants_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Permission already defined as permissions

// Qualification
export const qualifications = sqliteTable(
  'qualifications',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    title: text('title'),
    order: integer('order').default(0),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
);

// Relation (polymorphic)
export const relationsTable = sqliteTable(
  'relations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    source_aid: text('source_aid').notNull(),
    target_aid: text('target_aid').notNull(),
    status_name: text('status_name'),
    order: integer('order').default(0),
    xaid: text('xaid'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
    deleted_at: integer('deleted_at'),
    gin: text('gin'),
    fts: text('fts'),
    data_in: text('data_in'),
    data_out: text('data_out'),
  },
  (t) => ({
    sourceIdx: index('ix_relations_source').on(t.source_aid),
    targetIdx: index('ix_relations_target').on(t.target_aid),
    ginJson: check('ck_relations_gin_json', sql`json_valid(${t.gin})`),
    dataInJson: check('ck_relations_data_in_json', sql`json_valid(${t.data_in})`),
    dataOutJson: check('ck_relations_data_out_json', sql`json_valid(${t.data_out})`),
  }),
);

// Roles
export const roles = sqliteTable(
  'roles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    order: integer('order').default(0),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
  (t) => ({
    codeUx: uniqueIndex('ux_roles_code').on(t.code),
  }),
);

// Role Permissions
export const role_permissions = sqliteTable(
  'role_permissions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    role_id: integer('role_id').notNull(),
    permission_id: integer('permission_id').notNull(),
  },
  (t) => ({
    roleIdx: index('ix_role_permissions_role').on(t.role_id),
    permIdx: index('ix_role_permissions_perm').on(t.permission_id),
  }),
);

export const rolePermissionsRelations = relations(role_permissions, ({ one }) => ({
  role: one(roles, { fields: [role_permissions.role_id], references: [roles.id] }),
  permission: one(permissions, { fields: [role_permissions.permission_id], references: [permissions.id] }),
}));

// Segment
export const segments = sqliteTable(
  'segments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    said: text('said'),
    title: text('title'),
    order: integer('order').default(0),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
);

// Settings
export const settings = sqliteTable(
  'settings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    key: text('key').notNull(),
    value: text('value'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
  (t) => ({
    keyUx: uniqueIndex('ux_settings_key').on(t.key),
  }),
);

// Text
export const texts = sqliteTable(
  'texts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    title: text('title'),
    content: text('content'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
);

// Text Variant
export const text_variants = sqliteTable(
  'text_variants',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    text_id: integer('text_id'),
    title: text('title'),
    content: text('content'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
  (t) => ({
    textIdx: index('ix_text_variants_text_id').on(t.text_id),
  }),
);

// Template
export const templates = sqliteTable(
  'templates',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    title: text('title'),
    content: text('content'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
);

// University (stub)
export const universities = sqliteTable(
  'universities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    title: text('title'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
);

// Users (app users)
export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    email: text('email').notNull(),
    name: text('name'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
  (t) => ({
    emailUx: uniqueIndex('ux_users_email').on(t.email),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  journals: many(journals),
}));

// User Ban
export const user_bans = sqliteTable(
  'user_bans',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id').notNull(),
    reason: text('reason'),
    created_at: integer('created_at').notNull().default(nowUnix),
  },
  (t) => ({
    userIdx: index('ix_user_bans_user').on(t.user_id),
  }),
);

// User Session
export const user_sessions = sqliteTable(
  'user_sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id').notNull(),
    session_token: text('session_token').notNull(),
    expires_at: integer('expires_at'),
    created_at: integer('created_at').notNull().default(nowUnix),
  },
  (t) => ({
    tokenUx: uniqueIndex('ux_user_sessions_token').on(t.session_token),
    userIdx: index('ix_user_sessions_user').on(t.user_id),
  }),
);

// User Verification
export const user_verifications = sqliteTable(
  'user_verifications',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id').notNull(),
    token: text('token').notNull(),
    created_at: integer('created_at').notNull().default(nowUnix),
    expires_at: integer('expires_at'),
  },
  (t) => ({
    tokenUx: uniqueIndex('ux_user_verifications_token').on(t.token),
    userIdx: index('ix_user_verifications_user').on(t.user_id),
  }),
);

// Vote
export const votes = sqliteTable(
  'votes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    voter_aid: text('voter_aid'),
    target_aid: text('target_aid'),
    value: integer('value').default(0),
    created_at: integer('created_at').notNull().default(nowUnix),
  },
  (t) => ({
    voterIdx: index('ix_votes_voter').on(t.voter_aid),
    targetIdx: index('ix_votes_target').on(t.target_aid),
  }),
);

// Wallet
export const wallets = sqliteTable(
  'wallets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    owner_aid: text('owner_aid'),
    balance: integer('balance').default(0),
    currency_id: text('currency_id'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
  (t) => ({
    ownerIdx: index('ix_wallets_owner').on(t.owner_aid),
  }),
);

// Wallet Transaction
export const wallet_transactions = sqliteTable(
  'wallet_transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    wallet_id: integer('wallet_id').notNull(),
    amount: integer('amount').notNull(),
    type: text('type'),
    created_at: integer('created_at').notNull().default(nowUnix),
  },
  (t) => ({
    walletIdx: index('ix_wallet_transactions_wallet').on(t.wallet_id),
  }),
);

// Expanse (stub)
export const expanses = sqliteTable(
  'expanses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    title: text('title'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
);

// Yield (stub)
export const yields = sqliteTable(
  'yields',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    title: text('title'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
);

// Zoo (stub)
export const zoos = sqliteTable(
  'zoos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid'),
    title: text('title'),
    created_at: integer('created_at').notNull().default(nowUnix),
    updated_at: integer('updated_at').notNull().default(nowUnix),
  },
);

