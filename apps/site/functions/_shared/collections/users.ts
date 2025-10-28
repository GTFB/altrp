import BaseColumn from "../columns/BaseColumn";
import Base from "./BaseCollection";
import { format } from "date-fns";
import { ru, enUS, type Locale } from "date-fns/locale";

const dateLocales: Record<string, Locale> = {
    ru: ru,
    en: enUS,
};

export default class Users extends Base {
    created_at = new BaseColumn({ 
        hidden: false,
        type: 'datetime',
        format: (value: any, locale: string = 'en') => {
            if (!value) return "-";
            try {
                const date = new Date(value);
                const dateLocale = dateLocales[locale] || dateLocales.en;
                return format(date, "dd.MM.yyyy HH:mm", { locale: dateLocale });
            } catch {
                return String(value);
            }
        }
    });
    
    updated_at = new BaseColumn({ 
        hidden: false,
        type: 'datetime',
        format: (value: any, locale: string = 'en') => {
            if (!value) return "-";
            try {
                const date = new Date(value);
                const dateLocale = dateLocales[locale] || dateLocales.en;
                return format(date, "dd.MM.yyyy HH:mm", { locale: dateLocale });
            } catch {
                return String(value);
            }
        }
    });
    
    email_verified_at = new BaseColumn({ 
        hidden: false,
        type: 'datetime',
        format: (value: any, locale: string = 'en') => {
            if (!value) return "-";
            try {
                const date = new Date(value);
                const dateLocale = dateLocales[locale] || dateLocales.en;
                return format(date, "dd.MM.yyyy HH:mm", { locale: dateLocale });
            } catch {
                return String(value);
            }
        }
    });
    
    last_login_at = new BaseColumn({ 
        hidden: false,
        type: 'datetime',
        format: (value: any, locale: string = 'en') => {
            if (!value) return "-";
            try {
                const date = new Date(value);
                const dateLocale = dateLocales[locale] || dateLocales.en;
                return format(date, "dd.MM.yyyy HH:mm", { locale: dateLocale });
            } catch {
                return String(value);
            }
        }
    });
    
    password_hash = new BaseColumn({ hidden: true });
    hash = new BaseColumn({ hidden: true });
    salt = new BaseColumn({ hidden: true });
    is_active = new BaseColumn({ type: 'boolean' });
    constructor() {
        super('users');
    }
}