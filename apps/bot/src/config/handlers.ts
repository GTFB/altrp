// handlers.ts
//import { TelegramBotWorker } from './bot';
import { TelegramBotWorker } from '../worker/bot';
import { UserContextManager } from '../core/user-context';
import { normalizeVKLink } from '../core/helpers';

export const createCustomHandlers = (worker: TelegramBotWorker) => {
  const handlerWorker = {
    d1Storage: worker['d1Storage'],
    flowEngine: worker['flowEngine'],
    env: worker['env'],
    messageService: worker['messageService'],
    topicService: worker['topicService']
  };

  // Проверяем, что flowEngine доступен
  if (!handlerWorker.flowEngine) {
    console.error('❌ flowEngine is not available in handlerWorker');
    throw new Error('flowEngine is not initialized');
  }
  
  return {
    // Обработчик регистрации пользователя
    registerUser: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`👤 Registering user ${telegramId}`);
      
      // Проверяем, есть ли уже пользователь в базе
      let existingUser = await handlerWorker.d1Storage.getUser(telegramId);
      
      if (!existingUser) {
        // Получаем информацию о пользователе из Telegram (будет передана через контекст)
        const userInfo = await contextManager.getVariable(telegramId, '_system.currentMessage');
        
        if (userInfo && userInfo.from) {
          // Создаем топик в админ группе для нового пользователя
          const topicId = await handlerWorker.topicService.createTopicInAdminGroup(telegramId, userInfo.from);
          
          // Регистрируем пользователя
          const newUser = {
            telegramId: telegramId,
            firstName: userInfo.from.first_name,
            lastName: userInfo.from.last_name || '',
            username: userInfo.from.username || '',
            registeredAt: new Date().toISOString(),
            topicId: topicId || 0
          };

          await handlerWorker.d1Storage.addUser(newUser);
          console.log(`✅ New user ${telegramId} registered via flow`);
          
          // Сохраняем информацию о регистрации в контексте
          await contextManager.setVariable(telegramId, 'registration.isNewUser', true);
          await contextManager.setVariable(telegramId, 'registration.topicId', topicId);
        }
      } else {
        console.log(`👤 User ${telegramId} already exists`);
        await contextManager.setVariable(telegramId, 'registration.isNewUser', false);
      }
    },

    // Обработчик проверки подписки
    processSubscriptionCheck: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`📋 Processing subscription check for user ${telegramId}`);
      
      const vkLink = await contextManager.getVariable(telegramId, 'subscription.vk_link');
      if (vkLink) {
        // Нормализуем VK ссылку (добавляем https://vk.com/ если нужно)
        const normalizedVkLink = normalizeVKLink(vkLink);
        console.log(`📝 VK link normalized: "${vkLink}" → "${normalizedVkLink}"`);
        
        // Сохраняем нормализованную VK ссылку в базу данных
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (user) {
          const userData = user.data ? JSON.parse(user.data) : {};
          userData.vk = normalizedVkLink;
          await handlerWorker.d1Storage.updateUserData(telegramId, JSON.stringify(userData));
          
          // Отправляем запрос на проверку в топик
          if (user.topicId) {
            const currentDateTime = new Date().toLocaleString('ru-RU', {
              timeZone: 'Europe/Moscow',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            const topicMessage = `Пользователь просит проверить подписки в группах

ID: ${telegramId}
Username: @${user.username || 'не указан'}
Имя: ${user.firstName || ''} ${user.lastName || ''}`.trim() + `
VK: ${normalizedVkLink}

Дата и время: ${currentDateTime}`;

            const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
            await handlerWorker.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
          }
        }
      }
    },

    // Обработчик запроса на консультацию бухгалтера
    processConsultationRequest: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`📋 Processing consultation for user ${telegramId}`);
      
      const consultationType = await contextManager.getVariable(telegramId, 'consultation.type');
      if (consultationType) {
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (user) {
          const userData = user.data ? JSON.parse(user.data) : {};
          await handlerWorker.d1Storage.updateUserData(telegramId, JSON.stringify(userData));
          
          if (user.topicId) {
            const currentDateTime = new Date().toLocaleString('ru-RU', {
              timeZone: 'Europe/Moscow',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            const consultationRequest = await contextManager.getVariable(telegramId, 'consultation.request');

            const topicMessage = `Запрос на помощь ${consultationType === 'lawyer' ? 'юриста' : 'бухгалтера'}

ID: ${telegramId}
Username: @${user.username || 'не указан'}
Имя: ${user.firstName || ''} ${user.lastName || ''}`.trim() + `

Дата и время: ${currentDateTime}

Вопрос: ${consultationRequest}
`;

            const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
            await handlerWorker.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
          }
        }
      }
    },

    // Поиск компании по PIB
    searchingCompanyByPib: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🔍 Searching company by PIB for user ${telegramId}`);

      try {
        const clientPib = await contextManager.getVariable(telegramId, 'client.pib');
        
        if (!clientPib) {
          console.warn(`⚠️ No PIB found for user ${telegramId}`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'ask_to_client_account');
          return;
        }

        const result = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM companies WHERE pib = ? ORDER BY id LIMIT 1', 
          [clientPib]
        );

        if (result.results.length > 0) {
          const company = result.results[0];
          console.log(`✅ Company found for PIB ${clientPib}: ${company.name}`);

          // Сохраняем найденные данные компании в контексте
          await contextManager.setVariable(telegramId, 'client', {
            id: company.id,
            name: company.name,
            pib: company.pib,
            account_number: company.account_number,
            address: company.address,
          });

          // Переходим к показу карточки компании
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
        } else {
          console.log(`❌ No company found for PIB ${clientPib}`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'ask_to_client_account');
        }
      } catch (error) {
        console.error(`❌ Error searching company by PIB for user ${telegramId}:`, error);
        await handlerWorker.flowEngine.goToStep(telegramId, 'ask_to_client_pib');
      }
    },

    // Обработчик проверки языка и маршрутизации
    checkLanguageAndRoute: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🔍 Checking language for user ${telegramId}`);
      
      const user = await handlerWorker.d1Storage.getUser(telegramId);
      
      if (user?.language) {
        // У пользователя есть язык - сразу в onboarding
        console.log(`✅ User ${telegramId} has language: ${user.language}, going to onboarding`);
        await handlerWorker.flowEngine.startFlow(telegramId, 'onboarding');
      } else {
        // У пользователя нет языка - показываем выбор языка
        console.log(`❌ User ${telegramId} has no language, showing language selection`);
        await handlerWorker.flowEngine.goToStep(telegramId, 'send_lang');
      }
    },

    // Обработчик сохранения языка пользователя
    saveLang: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🌍 Saving language for user ${telegramId}`);

      const language = await contextManager.getVariable(telegramId, 'profile.language');
      if (language) {
        // Сохраняем язык в БД через D1StorageService
        await handlerWorker.d1Storage.updateUser(telegramId, { language });
        console.log(`✅ Language ${language} saved for user ${telegramId}`);
      } else {
        console.warn(`⚠️ No language found in context for user ${telegramId}`);
      }
    },

    // Обработчик проверки компании пользователя
    checkUserCompany: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🔍 Checking if user ${telegramId} has company`);

      try {
        // Получаем пользователя из базы данных
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          // Переходим к созданию компании
          await handlerWorker.flowEngine.goToStep(telegramId, 'send_welcome');
          return;
        }

        // Проверяем есть ли записи в company_users для этого пользователя
        const result = await handlerWorker.d1Storage.executeQuery(
          'SELECT COUNT(*) as count FROM company_users WHERE user_id = ?',
          [user.id]
        );

        const hasCompany = result.results[0].count > 0;

        if (hasCompany) {
          console.log(`✅ User ${telegramId} has company, completing onboarding`);
          // Пользователь имеет компанию, завершаем onboarding и выходим в главное меню
          //await this.flowEngine.completeFlow(telegramId);
          await handlerWorker.flowEngine.startFlow(telegramId, 'menu');
        } else {
          console.log(`❌ User ${telegramId} has no company, going to onboarding`);
          // Пользователь не имеет компании, переходим к созданию
          await handlerWorker.flowEngine.goToStep(telegramId, 'send_welcome');
        }

      } catch (error) {
        console.error(`❌ Error checking user company for ${telegramId}:`, error);
        // В случае ошибки переходим к созданию компании
        await handlerWorker.flowEngine.goToStep(telegramId, 'send_welcome');
      }
    },

    // Обработчик создания компании и главной услуги
    createCompanyAndMainService: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Creating company and main service for user ${telegramId}`);

      const companyData = await contextManager.getVariable(telegramId, 'company') || {};
      if (companyData && companyData.name && companyData.pib && companyData.okved && companyData.phone && companyData.email) {
        try {
          // Получаем пользователя из базы данных
          const user = await handlerWorker.d1Storage.getUser(telegramId);
          if (!user || !user.id) {
            console.error(`❌ User ${telegramId} not found in database`);
            return;
          }

          // Создаем компанию и получаем её ID
          const companyResult = await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO companies (name, pib, okved, phone, email) VALUES (?, ?, ?, ?, ?)',
            [companyData.name, companyData.pib, companyData.okved, companyData.phone, companyData.email]
          );

          const companyId = companyResult.meta.last_row_id;
          console.log(`✅ Company created with ID ${companyId} for user ${telegramId}`);

          // Создаем запись в company_users
          await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO company_users (user_id, company_id) VALUES (?, ?)',
            [user.id, companyId]
          );

          console.log(`✅ Company-user relationship created for user ${telegramId} and company ${companyId}`);

          const serviceData = await contextManager.getVariable(telegramId, 'mainService') || {};
          if (serviceData && serviceData.name) {
            try {
              // Создаем компанию и получаем её ID
              await handlerWorker.d1Storage.executeQuery(
                'INSERT INTO services (name, description, company_id) VALUES (?, ?, ?)',
                [serviceData.name, 'main', companyId]
              );

              console.log(`✅ Main service created for user ${telegramId}`);

              const topicMessage = `👤 Профиль:

Язык: ${user.language || 'Не указан'}

Название: ${companyData.name || 'Не указано'}
PIB: ${companyData.pib || 'Не указан'}
ОКВЭД: ${companyData.okved || 'Не указан'}

Услуга: ${serviceData.name || 'Не указана'}`;

              const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
              if (user.topicId) {
                await handlerWorker.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
              }

            } catch (error) {
              console.error(`❌ Error creating Main service for user ${telegramId}:`, error);
            }
          } else {
            console.warn(`⚠️ Missing Main service data for user ${telegramId}`);
          }

        } catch (error) {
          console.error(`❌ Error creating company for user ${telegramId}:`, error);
        }
      } else {
        console.warn(`⚠️ Missing company data for user ${telegramId}`);
      }

    },

    updateCompany: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Updating company for user ${telegramId}`);
    
      const companyData = await contextManager.getVariable(telegramId, 'company') || {};
      if (companyData && (companyData.name || companyData.pib || companyData.okved)) {
        try {
          const user = await handlerWorker.d1Storage.getUser(telegramId);
          if (!user || !user.id) {
            console.error(`❌ User ${telegramId} not found in database`);
            await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
            return;
          }
    
          const companyUserResult = await handlerWorker.d1Storage.executeQuery(
            'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
            [user.id]
          );
    
          if (!companyUserResult.results.length) {
            console.warn(`⚠️ No company found for user ${telegramId}`);
            await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
            return;
          }
    
          const companyId = companyUserResult.results[0].company_id;
    
          await handlerWorker.d1Storage.executeQuery(
            'UPDATE companies SET name = ?, pib = ?, okved = ? WHERE id = ?',
            [companyData.name, companyData.pib, companyData.okved, companyId]
          );
    
          console.log(`✅ Company updated with ID ${companyId} for user ${telegramId}`);
    
        } catch (error) {
          console.error(`❌ Error updating company for user ${telegramId}:`, error);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
        }
      } else {
        console.warn(`⚠️ Missing company data for user ${telegramId}`);
        await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
      }
    },

    saveClientCompany: async (telegramId: number, contextManager: UserContextManager) => {
      //const company = await contextManager.getVariable(telegramId, 'client.company');

      const company = await contextManager.getVariable(telegramId, 'client') || {};

      await handlerWorker.d1Storage.executeQuery(
        'INSERT INTO companies (name, pib, account_number, address) VALUES (?, ?, ?, ?)',
        [company.name, company.pib, company.account_number, company.address]
      );
    },

    generateClientCard: async (telegramId: number, contextManager: UserContextManager) => {
      //const company = await contextManager.getVariable(telegramId, 'client.company');

      const company = await contextManager.getVariable(telegramId, 'client') || {};

      await contextManager.setVariable(telegramId, 'invoice.customer_id', company.id);
      await contextManager.setVariable(telegramId, 'invoice.customer_name', company.name);
      await contextManager.setVariable(telegramId, 'invoice.customer_pib', company.pib);
      await contextManager.setVariable(telegramId, 'invoice.customer_account_number', company.account_number);
      await contextManager.setVariable(telegramId, 'invoice.customer_address', company.address);

      return `📋 Карточка клиента:

    Название: ${company.name || 'Не указано'}
    PIB: ${company.pib || 'Не указан'}
    Р/С: ${company.account_number || 'Не указан'}
    Адрес: ${company.address || 'Не указан'}

    Выберите действие:`;
    },

    generateServiceCard: async (telegramId: number, contextManager: UserContextManager) => {
      try {
        // Получаем пользователя из базы данных
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          // Переходим к созданию компании
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return `Пользователь не найден`;
        }

        // Проверяем есть ли записи в company_users для этого пользователя
        const companyResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        const company = companyResult.results[0];

        // Выполняем запрос к базе данных для получения услуг компании
        const result = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM services WHERE company_id = ? AND description = ? ORDER BY id LIMIT 1',
          [company.company_id, 'main']
        );

        if (result.results.length > 0) {
          const service = result.results[0];
          
          // Сохраняем найденную услугу в контексте
          await contextManager.setVariable(telegramId, 'mainService', service);

          await contextManager.setVariable(telegramId, 'invoice.service_id', service.id);
          await contextManager.setVariable(telegramId, 'invoice.service_name', service.name);

          return `📋 Карточка услуги:

    Название: ${service.name || 'Не указано'}

    Выберите действие:`;
        } else {
          console.warn(`⚠️ No services found for company ${company.id}`);
          return 'Услуги для компании не найдены.';
        }
      } catch (error) {
        console.error(`❌ Error generating service card for user ${telegramId}:`, error);
        return 'Ошибка при получении информации об услуге.';
      }
    },

    createMainService: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Creating company and main service for user ${telegramId}`);

      const serviceData = await contextManager.getVariable(telegramId, 'mainService') || {};
      if (serviceData && serviceData.name) {
        try {
          // Получаем пользователя из базы данных
          const user = await handlerWorker.d1Storage.getUser(telegramId);
          if (!user || !user.id) {
            console.error(`❌ User ${telegramId} not found in database`);
            // Переходим к созданию компании
            await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
            return;
          }

          // Проверяем есть ли записи в company_users для этого пользователя
          const companyResult = await handlerWorker.d1Storage.executeQuery(
            'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
            [user.id]
          );

          const company = companyResult.results[0];

      
          // обновляем услугу
          await handlerWorker.d1Storage.executeQuery(
            'UPDATE services SET description = ? WHERE company_id = ?',
            ['', company.company_id]
          );

          await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO services (name, description, company_id) VALUES (?, ?, ?)',
            [serviceData.name, 'main', company.company_id]
          );

          console.log(`✅ Main service created for user ${telegramId}`);

        } catch (error) {
          console.error(`❌ Error creating Main service for user ${telegramId}:`, error);
        }
      } else {
        console.warn(`⚠️ Missing service data for user ${telegramId}`);
      }
    },

    
    updateMainService: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🔄 Updating main service for user ${telegramId}`);

      try {
        const serviceData = await contextManager.getVariable(telegramId, 'mainService') || {};
        
        if (!serviceData || !serviceData.name) {
          console.warn(`⚠️ Missing service data for user ${telegramId}`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return;
        }

        // Получаем пользователя из базы данных
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return;
        }

        // Проверяем есть ли записи в company_users для этого пользователя
        const companyUserResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        if (!companyUserResult.results.length) {
          console.warn(`⚠️ No company found for user ${telegramId}`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return;
        }

        const companyId = companyUserResult.results[0].company_id;

        // Обновляем основную услугу компании
        const updateResult = await handlerWorker.d1Storage.executeQuery(
          'UPDATE services SET name = ? WHERE company_id = ? AND description = ? ORDER BY id LIMIT 1',
          [serviceData.name, companyId, 'main']
        );

        console.log(`✅ Main service updated for company ${companyId}, changes: ${updateResult.meta.changes}`);
        
      } catch (error) {
        console.error(`❌ Error updating service for user ${telegramId}:`, error);
      }
    },

    showInvoice: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Lookup invoice for user ${telegramId}`);

      const invoiceData = await contextManager.getVariable(telegramId, 'invoice') || {};
      if (invoiceData && invoiceData.customer_id && invoiceData.service_id && invoiceData.amount) {
        try {

          return `📋 Данные счета:

    Клиент: ${invoiceData.customer_name || 'Не указано'}
    PIB: ${invoiceData.customer_pib || 'Не указан'}
    Р/С: ${invoiceData.customer_account_number || 'Не указан'}
    Адрес: ${invoiceData.customer_address || 'Не указан'}

    Услуга: ${invoiceData.service_name || 'Не указано'}
    Сумма: ${invoiceData.amount || 'Не указано'}

    Выберите действие:`;

        } catch (error) {
          console.error(`❌ Error getting invoice for user ${telegramId}:`, error);
          return 'Ошибка при получении данных счета.';
        }
      } else {
        console.warn(`⚠️ Missing invoice data for user ${telegramId}`);
        return 'Данные счета не найдены.';
      }

    },

    getPayments: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Lookup payments for user ${telegramId}`);

      try {
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return 'Пользователь не найден';
        }

        // Проверяем есть ли записи в company_users для этого пользователя
        const companyResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        if (!companyResult.results.length) {
          console.warn(`⚠️ No company found for user ${telegramId}`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return 'Компания не найдена';
        }

        const companyId = companyResult.results[0].company_id;

        const paymentResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM payments WHERE company_id = ? ORDER BY created_at DESC',
          [companyId]
        );

        let text = `📋 Платежи:\n\n`;
        let i = 1;
        if (paymentResult.results.length === 0) {
          text += 'Платежей пока нет.';
        } else {
          for (const p of paymentResult.results) {
            text += `${i}. ${p.amount} RSD - ${new Date(p.created_at).toLocaleDateString('ru-RU')}\n`;
            text += `Статус: ${p.status}\n\n`;

            i++;
          }
        }

        return text;

      } catch (error) {
        console.error(`❌ Error getting payments for user ${telegramId}:`, error);
        return 'Ошибка при получении платежей';
      }
    },

    getExpenses: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Lookup expenses for user ${telegramId}`);

      try {
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return 'Пользователь не найден';
        }

        // Проверяем есть ли записи в company_users для этого пользователя
        const companyResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        if (!companyResult.results.length) {
          console.warn(`⚠️ No company found for user ${telegramId}`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return 'Компания не найдена';
        }

        const companyId = companyResult.results[0].company_id;

        const expenseResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM expenses WHERE company_id = ? ORDER BY created_at DESC',
          [companyId]
        );

        let text = `📋 Расходы:\n\n`;

        let i = 1;
        if (expenseResult.results.length === 0) {
          text += 'Расходов пока нет.';
        } else {
          for (const e of expenseResult.results) {
            text += `${i}. ${e.amount} RSD - ${new Date(e.created_at).toLocaleDateString('ru-RU')}\n`;
            text += `Описание: ${e.description}\n\n`;

            i++;
          }
        }

        return text;

      } catch (error) {
        console.error(`❌ Error getting expenses for user ${telegramId}:`, error);
        return 'Ошибка при получении расходов';
      }
    },
    
    createExpense: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Creating expense for user ${telegramId}`);

      const expenseData = await contextManager.getVariable(telegramId, 'expense') || {};
      if (expenseData && expenseData.amount) {
        try {
          const user = await handlerWorker.d1Storage.getUser(telegramId);
          if (!user || !user.id) {
            console.error(`❌ User ${telegramId} not found in database`);
            await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
            return;
          }

          // Проверяем есть ли записи в company_users для этого пользователя
          const companyResult = await handlerWorker.d1Storage.executeQuery(
            'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
            [user.id]
          );

          if (!companyResult.results.length) {
            console.warn(`⚠️ No company found for user ${telegramId}`);
            await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
            return;
          }

          const companyId = companyResult.results[0].company_id;

          // Создаем расход с текущей датой
          const expenseResult = await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO expenses (company_id, amount, description) VALUES (?, ?, ?)',
            [companyId, expenseData.amount, expenseData.description || null]
          );

          const expenseId = expenseResult.meta.last_row_id;
          console.log(`✅ Expense created for user ${telegramId}`);
          
          // Сохраняем ID созданного расхода в контекст
          await contextManager.setVariable(telegramId, 'expense.id', expenseId);

        } catch (error) {
          console.error(`❌ Error creating expense for user ${telegramId}:`, error);
          await handlerWorker.flowEngine.goToStep(telegramId, 'handle_get_expenses');
        }
      } else {
        console.warn(`⚠️ Missing expense data for user ${telegramId}`);
        await handlerWorker.flowEngine.goToStep(telegramId, 'handle_get_expenses');
      }
    },

    createInvoice: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Creating invoice for user ${telegramId}`);

      const invoiceData = await contextManager.getVariable(telegramId, 'invoice') || {};
      if (invoiceData && invoiceData.customer_id && invoiceData.service_id && invoiceData.amount) {
        try {
          const user = await handlerWorker.d1Storage.getUser(telegramId);
          if (!user || !user.id) {
            console.error(`❌ User ${telegramId} not found in database`);
            await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
            return;
          }

          // Проверяем есть ли записи в company_users для этого пользователя
          const companyResult = await handlerWorker.d1Storage.executeQuery(
            'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
            [user.id]
          );

          const company = companyResult.results[0];

          // Создаем счет с текущей датой (CURRENT_TIMESTAMP)
          const invoiceResult = await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO invoices (company_id, amount, status, customer_id) VALUES (?, ?, ?, ?)',
            [company.company_id, invoiceData.amount, 'CREATED', invoiceData.customer_id]
          );

          const invoiceId = invoiceResult.meta.last_row_id;

          // Связываем счет с услугой
          await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO invoice_services (invoice_id, service_id) VALUES (?, ?)',
            [invoiceId, invoiceData.service_id]
          );

          console.log(`✅ Invoice created for user ${telegramId}`);
          
          // Сохраняем ID созданного счета в контекст
          await contextManager.setVariable(telegramId, 'invoice.id', invoiceId);
          
          // Переход к следующему шагу
          //await this.flowEngine.goToStep(telegramId, 'show_invoice');

        } catch (error) {
          console.error(`❌ Error creating invoice for user ${telegramId}:`, error);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
        }
      } else {
        console.warn(`⚠️ Missing invoice data for user ${telegramId}`);
        await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
      }
    },

    getTemplate: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`📋 User ${telegramId} requested contract template`);

      const user = await handlerWorker.d1Storage.getUser(telegramId);
      if (user) {
        const userData = user.data ? JSON.parse(user.data) : {};
        await handlerWorker.d1Storage.updateUserData(telegramId, JSON.stringify(userData));
        
        if (user.topicId) {
          const currentDateTime = new Date().toLocaleString('ru-RU', {
            timeZone: 'Europe/Moscow',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          const templateRequest = await contextManager.getVariable(telegramId, 'need_template.type');

          const topicMessage = `Запрос шаблона ${templateRequest === 'contract' ? 'договора' : 'акта'}

ID: ${telegramId}
Username: @${user.username || 'не указан'}
Имя: ${user.firstName || ''} ${user.lastName || ''}`.trim() + `

Дата и время: ${currentDateTime}
`;

          const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
          await handlerWorker.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
        }
      }
    },

    getProfile: async (telegramId: number, contextManager: UserContextManager) => {
      try {
        // Получаем пользователя из базы данных
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          // Переходим к созданию компании
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return `Пользователь не найден`;
        }

        // Проверяем есть ли записи в company_users для этого пользователя
        const companyUserResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        const companyId = companyUserResult.results[0].company_id;

        const companyResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM companies WHERE id = ? ORDER BY id LIMIT 1',
          [companyId]
        );

        const company = companyResult.results[0];

        const serviceResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM services WHERE company_id = ? AND description = ? ORDER BY id LIMIT 1',
          [companyId, 'main']
        );

        const service = serviceResult.results[0];

return `👤 Профиль:

Язык: ${user.language || 'Не указан'}

Название: ${company.name || 'Не указано'}
PIB: ${company.pib || 'Не указан'}
ОКВЭД: ${company.okved || 'Не указан'}

Услуга: ${service.name || 'Не указана'}

Выберите действие:`;
        
      } catch (error) {
        console.error(`❌ Error generating profile for user ${telegramId}:`, error);
        return 'Ошибка при получении профиля.';
      }
    },

  };
};