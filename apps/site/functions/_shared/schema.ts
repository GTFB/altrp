export * from './schema/index';

export type {
	BaseMove,
	Product,
	ProductVariant,
	Deal,
	DealProduct,
	Contractor,
	Base,
	Wallet,
	WalletTransaction,
	Location,
	NewBaseMove,
	NewProduct,
	NewProductVariant,
	NewDeal,
	NewDealProduct,
	NewContractor,
	NewBase,
	NewWallet,
	NewWalletTransaction,
	NewLocation,
	NewJournal,
	Journal,
} from './schema/types';

import * as schemaExports from './schema/index';
export const schema = schemaExports;
