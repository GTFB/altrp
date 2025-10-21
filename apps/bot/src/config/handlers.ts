// handlers.ts
import { BotInterface } from '../core/bot-interface';
import { UserContextManager } from '../core/user-context';
import { normalizeVKLink } from '../core/helpers';

export const createCustomHandlers = (worker: BotInterface) => {
  const handlerWorker = {
    d1Storage: worker['d1Storage'],
    flowEngine: worker['flowEngine'],
    env: worker['env'],
    messageService: worker['messageService'],
    topicService: worker['topicService']
  };

  // Check that flowEngine is available
  if (!handlerWorker.flowEngine) {
    console.error('❌ flowEngine is not available in handlerWorker');
    throw new Error('flowEngine is not initialized');
  }
  
  return {
    // User registration handler
    registerUser: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`👤 Registering user ${telegramId}`);
      
      // Check if user already exists in database
      let existingUser = await handlerWorker.d1Storage.getUser(telegramId);
      
      if (!existingUser) {
        // Get user information from Telegram (will be passed through context)
        const userInfo = await contextManager.getVariable(telegramId, '_system.currentMessage');
        
        if (userInfo && userInfo.from) {
          // Create topic in admin group for new user
          const topicId = await handlerWorker.topicService.createTopicInAdminGroup(telegramId, userInfo.from);
          
          // Register user
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
          
          // Save registration information in context
          await contextManager.setVariable(telegramId, 'registration.isNewUser', true);
          await contextManager.setVariable(telegramId, 'registration.topicId', topicId);
        }
      } else {
        console.log(`👤 User ${telegramId} already exists`);
        await contextManager.setVariable(telegramId, 'registration.isNewUser', false);
      }
    },

    // Subscription check handler
    processSubscriptionCheck: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`📋 Processing subscription check for user ${telegramId}`);
      
      const vkLink = await contextManager.getVariable(telegramId, 'subscription.vk_link');
      if (vkLink) {
        // Normalize VK link (add https://vk.com/ if needed)
        const normalizedVkLink = normalizeVKLink(vkLink);
        console.log(`📝 VK link normalized: "${vkLink}" → "${normalizedVkLink}"`);
        
        // Save normalized VK link to database
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (user) {
          const userData = user.data ? JSON.parse(user.data) : {};
          userData.vk = normalizedVkLink;
          await handlerWorker.d1Storage.updateUserData(telegramId, JSON.stringify(userData));
          
          // Send verification request to topic
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

            const topicMessage = `User requests subscription check in groups

ID: ${telegramId}
Username: @${user.username || 'not specified'}
Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() + `
VK: ${normalizedVkLink}

Date and time: ${currentDateTime}`;

            const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
            await handlerWorker.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
          }
        }
      }
    },

    // Accountant consultation request handler
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

            const topicMessage = `Help request from ${consultationType === 'lawyer' ? 'lawyer' : 'accountant'}

ID: ${telegramId}
Username: @${user.username || 'not specified'}
Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() + `

Date and time: ${currentDateTime}

Question: ${consultationRequest}
`;

            const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
            await handlerWorker.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
          }
        }
      }
    },

    // Company search by PIB
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

          // Save found company data in context
          await contextManager.setVariable(telegramId, 'client', {
            id: company.id,
            name: company.name,
            pib: company.pib,
            account_number: company.account_number,
            address: company.address,
          });

          // Go to company card display
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

    // Language check and routing handler
    checkLanguageAndRoute: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🔍 Checking language for user ${telegramId}`);
      
      const user = await handlerWorker.d1Storage.getUser(telegramId);
      
      if (user?.language) {
        // User has language - go straight to onboarding
        console.log(`✅ User ${telegramId} has language: ${user.language}, going to onboarding`);
        await handlerWorker.flowEngine.startFlow(telegramId, 'onboarding');
      } else {
        // User has no language - show language selection
        console.log(`❌ User ${telegramId} has no language, showing language selection`);
        await handlerWorker.flowEngine.goToStep(telegramId, 'send_lang');
      }
    },

    // User language saving handler
    saveLang: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🌍 Saving language for user ${telegramId}`);

      const language = await contextManager.getVariable(telegramId, 'profile.language');
      if (language) {
        // Save language to DB through D1StorageService
        await handlerWorker.d1Storage.updateUser(telegramId, { language });
        console.log(`✅ Language ${language} saved for user ${telegramId}`);
      } else {
        console.warn(`⚠️ No language found in context for user ${telegramId}`);
      }
    },

    // User company check handler
    checkUserCompany: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🔍 Checking if user ${telegramId} has company`);

      try {
        // Get user from database
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          // Go to company creation
          await handlerWorker.flowEngine.goToStep(telegramId, 'send_welcome');
          return;
        }

        // Check if there are records in company_users for this user
        const result = await handlerWorker.d1Storage.executeQuery(
          'SELECT COUNT(*) as count FROM company_users WHERE user_id = ?',
          [user.id]
        );

        const hasCompany = result.results[0].count > 0;

        if (hasCompany) {
          console.log(`✅ User ${telegramId} has company, completing onboarding`);
          // User has company, complete onboarding and go to main menu
          //await this.flowEngine.completeFlow(telegramId);
          await handlerWorker.flowEngine.startFlow(telegramId, 'menu');
        } else {
          console.log(`❌ User ${telegramId} has no company, going to onboarding`);
          // User has no company, go to creation
          await handlerWorker.flowEngine.goToStep(telegramId, 'send_welcome');
        }

      } catch (error) {
        console.error(`❌ Error checking user company for ${telegramId}:`, error);
        // In case of error, go to company creation
        await handlerWorker.flowEngine.goToStep(telegramId, 'send_welcome');
      }
    },

    // Company and main service creation handler
    createCompanyAndMainService: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Creating company and main service for user ${telegramId}`);

      const companyData = await contextManager.getVariable(telegramId, 'company') || {};
      if (companyData && companyData.name && companyData.pib && companyData.okved && companyData.phone && companyData.email) {
        try {
          // Get user from database
          const user = await handlerWorker.d1Storage.getUser(telegramId);
          if (!user || !user.id) {
            console.error(`❌ User ${telegramId} not found in database`);
            return;
          }

          // Create company and get its ID
          const companyResult = await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO companies (name, pib, okved, phone, email) VALUES (?, ?, ?, ?, ?)',
            [companyData.name, companyData.pib, companyData.okved, companyData.phone, companyData.email]
          );

          const companyId = companyResult.meta.last_row_id;
          console.log(`✅ Company created with ID ${companyId} for user ${telegramId}`);

          // Create record in company_users
          await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO company_users (user_id, company_id) VALUES (?, ?)',
            [user.id, companyId]
          );

          console.log(`✅ Company-user relationship created for user ${telegramId} and company ${companyId}`);

          const serviceData = await contextManager.getVariable(telegramId, 'mainService') || {};
          if (serviceData && serviceData.name) {
            try {
              // Create company and get its ID
              await handlerWorker.d1Storage.executeQuery(
                'INSERT INTO services (name, description, company_id) VALUES (?, ?, ?)',
                [serviceData.name, 'main', companyId]
              );

              console.log(`✅ Main service created for user ${telegramId}`);

              const topicMessage = `👤 Profile:

Language: ${user.language || 'Not specified'}

Name: ${companyData.name || 'Not specified'}
PIB: ${companyData.pib || 'Not specified'}
OKVED: ${companyData.okved || 'Not specified'}

Service: ${serviceData.name || 'Not specified'}`;

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

      return `📋 Client card:

    Name: ${company.name || 'Not specified'}
    PIB: ${company.pib || 'Not specified'}
    Account: ${company.account_number || 'Not specified'}
    Address: ${company.address || 'Not specified'}

    Choose action:`;
    },

    generateServiceCard: async (telegramId: number, contextManager: UserContextManager) => {
      try {
        // Get user from database
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          // Go to company creation
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return `User not found`;
        }

        // Check if there are records in company_users for this user
        const companyResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        const company = companyResult.results[0];

        // Execute query to database to get company services
        const result = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM services WHERE company_id = ? AND description = ? ORDER BY id LIMIT 1',
          [company.company_id, 'main']
        );

        if (result.results.length > 0) {
          const service = result.results[0];
          
          // Save found service in context
          await contextManager.setVariable(telegramId, 'mainService', service);

          await contextManager.setVariable(telegramId, 'invoice.service_id', service.id);
          await contextManager.setVariable(telegramId, 'invoice.service_name', service.name);

          return `📋 Service card:

    Name: ${service.name || 'Not specified'}

    Choose action:`;
        } else {
          console.warn(`⚠️ No services found for company ${company.id}`);
          return 'Services for company not found.';
        }
      } catch (error) {
        console.error(`❌ Error generating service card for user ${telegramId}:`, error);
        return 'Error getting service information.';
      }
    },

    createMainService: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Creating company and main service for user ${telegramId}`);

      const serviceData = await contextManager.getVariable(telegramId, 'mainService') || {};
      if (serviceData && serviceData.name) {
        try {
          // Get user from database
          const user = await handlerWorker.d1Storage.getUser(telegramId);
          if (!user || !user.id) {
            console.error(`❌ User ${telegramId} not found in database`);
            // Go to company creation
            await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
            return;
          }

          // Check if there are records in company_users for this user
          const companyResult = await handlerWorker.d1Storage.executeQuery(
            'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
            [user.id]
          );

          const company = companyResult.results[0];

      
          // Update service
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

        // Get user from database
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return;
        }

        // Check if there are records in company_users for this user
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

        // Update main company service
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

          return `📋 Invoice data:

    Client: ${invoiceData.customer_name || 'Not specified'}
    PIB: ${invoiceData.customer_pib || 'Not specified'}
    Account: ${invoiceData.customer_account_number || 'Not specified'}
    Address: ${invoiceData.customer_address || 'Not specified'}

    Service: ${invoiceData.service_name || 'Not specified'}
    Amount: ${invoiceData.amount || 'Not specified'}

    Choose action:`;

        } catch (error) {
          console.error(`❌ Error getting invoice for user ${telegramId}:`, error);
          return 'Error getting invoice data.';
        }
      } else {
        console.warn(`⚠️ Missing invoice data for user ${telegramId}`);
        return 'Invoice data not found.';
      }

    },

    getPayments: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Lookup payments for user ${telegramId}`);

      try {
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return 'User not found';
        }

        // Check if there are records in company_users for this user
        const companyResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        if (!companyResult.results.length) {
          console.warn(`⚠️ No company found for user ${telegramId}`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return 'Company not found';
        }

        const companyId = companyResult.results[0].company_id;

        const paymentResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM payments WHERE company_id = ? ORDER BY created_at DESC',
          [companyId]
        );

        let text = `📋 Payments:\n\n`;
        let i = 1;
        if (paymentResult.results.length === 0) {
          text += 'No payments yet.';
        } else {
          for (const p of paymentResult.results) {
            text += `${i}. ${p.amount} RSD - ${new Date(p.created_at).toLocaleDateString('ru-RU')}\n`;
            text += `Status: ${p.status}\n\n`;

            i++;
          }
        }

        return text;

      } catch (error) {
        console.error(`❌ Error getting payments for user ${telegramId}:`, error);
        return 'Error getting payments';
      }
    },

    getExpenses: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🆕 Lookup expenses for user ${telegramId}`);

      try {
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return 'User not found';
        }

        // Check if there are records in company_users for this user
        const companyResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        if (!companyResult.results.length) {
          console.warn(`⚠️ No company found for user ${telegramId}`);
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return 'Company not found';
        }

        const companyId = companyResult.results[0].company_id;

        const expenseResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM expenses WHERE company_id = ? ORDER BY created_at DESC',
          [companyId]
        );

        let text = `📋 Expenses:\n\n`;

        let i = 1;
        if (expenseResult.results.length === 0) {
          text += 'No expenses yet.';
        } else {
          for (const e of expenseResult.results) {
            text += `${i}. ${e.amount} RSD - ${new Date(e.created_at).toLocaleDateString('ru-RU')}\n`;
            text += `Description: ${e.description}\n\n`;

            i++;
          }
        }

        return text;

      } catch (error) {
        console.error(`❌ Error getting expenses for user ${telegramId}:`, error);
        return 'Error getting expenses';
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

          // Check if there are records in company_users for this user
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

          // Create expense with current date
          const expenseResult = await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO expenses (company_id, amount, description) VALUES (?, ?, ?)',
            [companyId, expenseData.amount, expenseData.description || null]
          );

          const expenseId = expenseResult.meta.last_row_id;
          console.log(`✅ Expense created for user ${telegramId}`);
          
          // Save created expense ID to context
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

          // Check if there are records in company_users for this user
          const companyResult = await handlerWorker.d1Storage.executeQuery(
            'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
            [user.id]
          );

          const company = companyResult.results[0];

          // Create invoice with current date (CURRENT_TIMESTAMP)
          const invoiceResult = await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO invoices (company_id, amount, status, customer_id) VALUES (?, ?, ?, ?)',
            [company.company_id, invoiceData.amount, 'CREATED', invoiceData.customer_id]
          );

          const invoiceId = invoiceResult.meta.last_row_id;

          // Link invoice with service
          await handlerWorker.d1Storage.executeQuery(
            'INSERT INTO invoice_services (invoice_id, service_id) VALUES (?, ?)',
            [invoiceId, invoiceData.service_id]
          );

          console.log(`✅ Invoice created for user ${telegramId}`);
          
          // Save created invoice ID to context
          await contextManager.setVariable(telegramId, 'invoice.id', invoiceId);
          
          // Go to next step
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

          const topicMessage = `Template request for ${templateRequest === 'contract' ? 'contract' : 'act'}

ID: ${telegramId}
Username: @${user.username || 'not specified'}
Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() + `

Date and time: ${currentDateTime}
`;

          const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
          await handlerWorker.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
        }
      }
    },

    getProfile: async (telegramId: number, contextManager: UserContextManager) => {
      try {
        // Get user from database
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          // Go to company creation
          await handlerWorker.flowEngine.goToStep(telegramId, 'show_client_card');
          return `User not found`;
        }

        // Check if there are records in company_users for this user
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

return `👤 Profile:

Language: ${user.language || 'Not specified'}

Name: ${company.name || 'Not specified'}
PIB: ${company.pib || 'Not specified'}
OKVED: ${company.okved || 'Not specified'}

Service: ${service.name || 'Not specified'}

Choose action:`;
        
      } catch (error) {
        console.error(`❌ Error generating profile for user ${telegramId}:`, error);
        return 'Error getting profile.';
      }
    },

    // Command handlers
    handleStartCommandFlow: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;

      console.log(`🚀 Handling /start command via flow for user ${userId}`);

      // Get or create user in database to get dbUserId
      let existingUser = await handlerWorker.d1Storage.getUser(userId);
      
      if (!existingUser) {
        // Create topic in admin group for new user
        const topicId = await handlerWorker.topicService.createTopicInAdminGroup(userId, message.from);
        
        // Register user minimally to get dbUserId
        const newUser = {
          telegramId: userId,
          firstName: message.from.first_name,
          lastName: message.from.last_name || '',
          username: message.from.username || '',
          registeredAt: new Date().toISOString(),
          topicId: topicId || 0
        };

        await handlerWorker.d1Storage.addUser(newUser);
        console.log(`✅ New user ${userId} registered for start flow`);
        
        // Update user reference
        existingUser = await handlerWorker.d1Storage.getUser(userId);
      }

      if (!existingUser || !existingUser.id) {
        console.error(`Cannot start flow: user ${userId} registration failed`);
        return;
      }

      // Get or create user context
      await bot.userContextManager.getOrCreateContext(userId, existingUser.id);
      
      // Save info about the current message for handlers
      await bot.userContextManager.setVariable(userId, '_system.currentMessage', message);

        // Start registration flow
        await handlerWorker.flowEngine.startFlow(userId, 'start_registration');
        //await handlerWorker.flowEngine.startFlow(userId, 'test_dynamic_callback');

      console.log(`✅ Start flow launched for user ${userId}`);
    },

    handleMenuCommandFlow: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;

      console.log(`🚀 Handling /menu command via flow for user ${userId}`);
     
      // Start menu flow
      await handlerWorker.flowEngine.startFlow(userId, 'menu');

      console.log(`✅ Menu flow launched for user ${userId}`);
    },

    handleHelpCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;

      console.log(`🚀 Handling /help command for user ${userId}`);
      
      const dbUserId = await bot.getDbUserId(chatId);
      if (dbUserId) {
        const helpText = 'Available commands:\n/start - start working\n/menu - show main menu\n/help - help';
        await handlerWorker.messageService.sendMessage(chatId, helpText, dbUserId);
      }
    },

    handleConfirmedCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;
      const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
      const topicId = (message as any).message_thread_id;

      console.log(`Handling /confirmed command from user ${userId} in topic ${topicId}`);

      // Ensure the command is executed in the admin group
      if (chatId !== adminChatId) {
        console.log(`/confirmed command ignored - not in admin group`);
        return;
      }

      // Ensure the command is executed inside a topic
      if (!topicId) {
        console.log(`/confirmed command ignored - not in topic`);
        return;
      }

      // Find user by topic_id
      const targetUserId = await handlerWorker.d1Storage.getUserIdByTopic(topicId);
      
      if (!targetUserId) {
        console.log(`No user found for topic ${topicId}`);
        return;
      }

      console.log(`Found user ${targetUserId} for topic ${topicId}`);

      // Get user data
      const user = await handlerWorker.d1Storage.getUser(targetUserId);
      
      if (user) {
        // Add subscription confirmation with time in UTC
        const currentDateTime = new Date().toISOString();

        // Update user data
        const targetUser = await handlerWorker.d1Storage.getUser(targetUserId);
        const targetUserData = targetUser?.data ? JSON.parse(targetUser.data) : {};
        targetUserData.confirmation = {
          tg: true,
          vk: true,
          date_time: currentDateTime
        };
        await handlerWorker.d1Storage.updateUserData(targetUserId, JSON.stringify(targetUserData));
        
        console.log(`User ${targetUserId} session updated with confirmation`);
      }

      // Send message to user
      const messageText = `Yes! You're one of us! Subscriptions are confirmed!
Now you're participating in the giveaway!

We'll announce the results on our social networks — stay tuned and good luck! 🍀`;

      const dbUserId3 = await bot.getDbUserId(targetUserId);
      if (dbUserId3) {
        await handlerWorker.messageService.sendMessage(targetUserId, messageText, dbUserId3);
      }
      console.log(`Confirmed message sent to user ${targetUserId}`);
    },

    handleNotConfirmedCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;
      const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);
      const topicId = (message as any).message_thread_id;

      console.log(`Handling /not_confirmed command from user ${userId} in topic ${topicId}`);

      // Ensure the command is executed in the admin group
      if (chatId !== adminChatId) {
        console.log(`/not_confirmed command ignored - not in admin group`);
        return;
      }

      // Ensure the command is executed inside a topic
      if (!topicId) {
        console.log(`/not_confirmed command ignored - not in topic`);
        return;
      }

      // Find user by topic_id
      const targetUserId = await handlerWorker.d1Storage.getUserIdByTopic(topicId);
      
      if (!targetUserId) {
        console.log(`No user found for topic ${topicId}`);
        return;
      }

      console.log(`Found user ${targetUserId} for topic ${topicId}`);

      // Send message to user
      const messageText = `Hmm... Something doesn't add up! 😕

I can't see your subscription in one of our communities (or both).

Return, make sure you're subscribed to both, and press the "✨ Done! Check!" button again! We are waiting for you!`;

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "👉 Our Telegram",
              url: "https://t.me/ml_cosmetic"
            }
          ],
          [
            {
              text: "👉 Our VK group",
              url: "https://vk.com/public48764292"
            }
          ],
          [
            {
              text: "✨Done! Check!",
              callback_data: "check_subscription"
            }
          ]
        ]
      };

      const dbUserId5 = await bot.getDbUserId(targetUserId);
      if (dbUserId5) {
        await handlerWorker.messageService.sendMessageWithKeyboard(targetUserId, messageText, keyboard, dbUserId5);
      }
      console.log(`Not confirmed message sent to user ${targetUserId}`);
    },

    // Example dynamic callback handler for course selection
    generateCourseButtons: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`📚 Generating course buttons for user ${telegramId}`);
      
      try {
        // Simulate getting courses from database
        // In real implementation, this would be: await handlerWorker.d1Storage.getCourses();
        const courses = [
          { id: 1, name: 'Advanced React', price: 299 },
          { id: 2, name: 'Node.js Mastery', price: 399 },
          { id: 3, name: 'TypeScript Deep Dive', price: 249 },
          { id: 4, name: 'Vue.js 3', price: 199 }
        ];
        
        const buttons = courses.map(course => ({
          text: `${course.name} - $${course.price}`,
          value: course.id // This will be used in callback_data
        }));
        
        return {
          message: '🎓 Выберите курс для изучения:',
          buttons: buttons
        };
        
      } catch (error) {
        console.error(`❌ Error generating course buttons for user ${telegramId}:`, error);
        return {
          message: '❌ Ошибка загрузки курсов',
          buttons: []
        };
      }
    },

    // Example dynamic callback handler for service selection
    generateServiceButtons: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🔧 Generating service buttons for user ${telegramId}`);
      
      try {
        // Get user's company services from database
        const user = await handlerWorker.d1Storage.getUser(telegramId);
        if (!user || !user.id) {
          console.error(`❌ User ${telegramId} not found in database`);
          return {
            message: '❌ Пользователь не найден',
            buttons: []
          };
        }

        // Get company services
        const companyResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM company_users WHERE user_id = ? ORDER BY id LIMIT 1',
          [user.id]
        );

        if (!companyResult.results.length) {
          return {
            message: '❌ Компания не найдена',
            buttons: []
          };
        }

        const companyId = companyResult.results[0].company_id;
        const servicesResult = await handlerWorker.d1Storage.executeQuery(
          'SELECT * FROM services WHERE company_id = ? ORDER BY id',
          [companyId]
        );

        const buttons = servicesResult.results.map((service: any) => ({
          text: service.name,
          value: service.id
        }));
        
        return {
          message: '🔧 Выберите услугу:',
          buttons: buttons
        };
        
      } catch (error) {
        console.error(`❌ Error generating service buttons for user ${telegramId}:`, error);
        return {
          message: '❌ Ошибка загрузки услуг',
          buttons: []
        };
      }
    },

    // Handler to show selected course details
    showSelectedCourse: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`📚 Showing selected course for user ${telegramId}`);
      
      const courseId = await contextManager.getVariable(telegramId, 'selected.course_id');
      
      if (!courseId) {
        return '❌ Курс не выбран';
      }
      
      // Simulate getting course details
      const courses = [
        { id: 1, name: 'Advanced React', price: 299, description: 'Продвинутый курс по React' },
        { id: 2, name: 'Node.js Mastery', price: 399, description: 'Мастерство в Node.js' },
        { id: 3, name: 'TypeScript Deep Dive', price: 249, description: 'Глубокое погружение в TypeScript' },
        { id: 4, name: 'Vue.js 3', price: 199, description: 'Современный Vue.js 3' }
      ];
      
      const course = courses.find(c => c.id == courseId);
      
      if (!course) {
        return '❌ Курс не найден';
      }
      
      return `✅ Выбран курс: ${course.name}
💰 Цена: $${course.price}
📝 Описание: ${course.description}

Теперь выберите услугу:`;
    },

    // Handler to show final selection
    showFinalSelection: async (telegramId: number, contextManager: UserContextManager) => {
      console.log(`🎯 Showing final selection for user ${telegramId}`);
      
      const courseId = await contextManager.getVariable(telegramId, 'selected.course_id');
      const serviceId = await contextManager.getVariable(telegramId, 'selected.service_id');
      
      return `🎉 Отлично! Ваш выбор:

📚 Курс: ${courseId}
🔧 Услуга: ${serviceId}

Спасибо за использование динамических callback кнопок!`;
    }

  };
};