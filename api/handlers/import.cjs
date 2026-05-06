const { query } = require('../lib/database.cjs');
const Papa = require('papaparse');
const { v4: uuidv4 } = require('uuid');

const getField = (row, names) => {
  const keyMap = {};
  Object.keys(row || {}).forEach((key) => {
    keyMap[String(key).trim().toLowerCase()] = row[key];
  });

  for (const name of names) {
    const val = keyMap[name.toLowerCase()];
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return undefined;
};

const parseDate = (input) => {
  if (input === undefined || input === null || input === '') return null;
  const value = String(input).trim();

  if (/^\d+$/.test(value)) {
    const n = Number(value);
    const ms = value.length === 10 ? n * 1000 : n;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  const isoMatch = value.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (isoMatch && isoMatch[1].length === 4) {
    const year = parseInt(isoMatch[1], 10);
    const month = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
    const day = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const amb = value.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (amb) {
    const a = parseInt(amb[1], 10);
    const b = parseInt(amb[2], 10);
    const year = parseInt(amb[3], 10);
    let day; let month;
    if (a > 12) {
      day = a; month = b;
    } else {
      month = a; day = b;
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const monthNames = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
  };

  const namedDateMatch = value.match(/^([0-9]{1,2})[\s\-/\.]+([A-Za-z]+)[\s\-/\.]+(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (namedDateMatch) {
    const day = parseInt(namedDateMatch[1], 10);
    const month = monthNames[namedDateMatch[2].toLowerCase()];
    const year = parseInt(namedDateMatch[3], 10);
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const namedDateAltMatch = value.match(/^([A-Za-z]+)[\s\-/\.]+([0-9]{1,2})[\s\,\/\.]+(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (namedDateAltMatch) {
    const month = monthNames[namedDateAltMatch[1].toLowerCase()];
    const day = parseInt(namedDateAltMatch[2], 10);
    const year = parseInt(namedDateAltMatch[3], 10);
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const compactIsoMatch = value.match(/^(\d{4})(\d{2})(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (compactIsoMatch) {
    return `${compactIsoMatch[1]}-${compactIsoMatch[2]}-${compactIsoMatch[3]}`;
  }

  const fallback = new Date(value);
  if (!Number.isNaN(fallback.getTime())) {
    const y = fallback.getUTCFullYear();
    const m = String(fallback.getUTCMonth() + 1).padStart(2, '0');
    const d = String(fallback.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
};

const coerceBoolean = (value) => {
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return true;
};

const buildCategoryMaps = (rows) => {
  const parents = {};
  const childrenByParent = {};

  rows.forEach((cat) => {
    const name = String(cat.name || '').trim().toLowerCase();
    if (!cat.parent_category_id) {
      parents[name] = cat.id;
    } else {
      if (!childrenByParent[cat.parent_category_id]) childrenByParent[cat.parent_category_id] = {};
      childrenByParent[cat.parent_category_id][name] = cat.id;
    }
  });

  return { parents, childrenByParent };
};

async function importAll(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let { csvData, autoCreate = true } = req.body;
    autoCreate = coerceBoolean(autoCreate);

    if (!csvData) {
      return res.status(400).json({ success: false, message: 'CSV data is required' });
    }

    const firstLine = csvData.split(/\r?\n/).find((line) => line && line.trim()) || '';
    let delimiter = ',';
    if (firstLine.indexOf('\t') !== -1) delimiter = '\t';
    else if (firstLine.indexOf(';') !== -1) delimiter = ';';

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter,
    });

    if (parsed.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV parsing error',
        errors: parsed.errors,
      });
    }

    const rows = parsed.data;
    const headerFields = (parsed.meta?.fields || []).map((field) => String(field || '').trim().toLowerCase());
    const hasTypeHeader = headerFields.some((field) => ['type', 'transaction type', 'transaction_type'].includes(field));
    const inferredFallback = !hasTypeHeader;

    const accountsResult = await query(
      'SELECT id, name FROM accounts WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    const accountMap = {};
    accountsResult.rows.forEach((account) => {
      accountMap[String(account.name || '').trim().toLowerCase()] = account.id;
    });

    const expenseCategoriesResult = await query(
      'SELECT id, name, parent_category_id FROM expense_categories WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    const incomeCategoriesResult = await query(
      'SELECT id, name, parent_category_id FROM income_categories WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    const expMaps = buildCategoryMaps(expenseCategoriesResult.rows);
    const incMaps = buildCategoryMaps(incomeCategoriesResult.rows);

    const ensureCategory = async (name, categoryType, parentMaps, childMaps) => {
      const normalized = String(name || '').trim().toLowerCase();
      if (!normalized) return null;
      if (parentMaps.parents[normalized]) return parentMaps.parents[normalized];
      if (!autoCreate) return null;
      const id = uuidv4();
      const table = categoryType === 'income' ? 'income_categories' : 'expense_categories';
      await query(
        `INSERT INTO ${table} (id, user_id, name, parent_category_id, is_active) VALUES ($1, $2, $3, NULL, true)`,
        [id, userId, name]
      );
      parentMaps.parents[normalized] = id;
      childMaps[id] = {};
      return id;
    };

    const ensureSubcategory = async (parentId, childName, categoryType, childMaps) => {
      const normalized = String(childName || '').trim().toLowerCase();
      if (!normalized) return null;
      if (childMaps[parentId] && childMaps[parentId][normalized]) return childMaps[parentId][normalized];
      if (!autoCreate) return null;
      const id = uuidv4();
      const table = categoryType === 'income' ? 'income_categories' : 'expense_categories';
      await query(
        `INSERT INTO ${table} (id, user_id, name, parent_category_id, is_active) VALUES ($1, $2, $3, $4, true)`,
        [id, userId, childName, parentId]
      );
      if (!childMaps[parentId]) childMaps[parentId] = {};
      childMaps[parentId][normalized] = id;
      return id;
    };

    const getOrCreateAccount = async (accountName) => {
      const normalized = String(accountName || '').trim().toLowerCase();
      if (!normalized) return null;
      if (accountMap[normalized]) return accountMap[normalized];
      if (!autoCreate) return null;
      const id = uuidv4();
      await query(
        'INSERT INTO accounts (id, user_id, name, account_type, balance, is_active, created_at) VALUES ($1, $2, $3, $4, 0, true, CURRENT_TIMESTAMP)',
        [id, userId, accountName, 'imported']
      );
      accountMap[normalized] = id;
      return id;
    };

    const results = {
      expenses: { successful: 0, failed: 0, errors: [] },
      income: { successful: 0, failed: 0, errors: [] },
      transfers: { successful: 0, failed: 0, errors: [] },
    };

    const parseAmount = (value) => {
      const normalized = String(value || '').trim().replace(/[^0-9.\-]/g, '');
      const numberValue = Number(normalized);
      return Number.isFinite(numberValue) ? numberValue : null;
    };

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      const lineNumber = rowIndex + 2;
      const rawType = getField(row, ['type', 'transaction type', 'transaction_type']) || '';
      const normalizedType = String(rawType || '').trim().toLowerCase();

      let categoryGroup = 'expense';
      if (!inferredFallback) {
        if (normalizedType.startsWith('inc')) categoryGroup = 'income';
        else if (normalizedType.startsWith('trans') || normalizedType.startsWith('trf')) categoryGroup = 'transfer';
        else if (normalizedType.startsWith('exp')) categoryGroup = 'expense';
        else categoryGroup = 'expense';
      }

      const amount = parseAmount(getField(row, ['amount', 'amt', 'value']));
      const dateValue = getField(row, ['date', 'transaction date', 'transaction_date', 'expense_date', 'income_date', 'transfer_date']);
      const description = getField(row, ['description', 'desc', 'notes']);
      const parsedDate = parseDate(dateValue);

      if (categoryGroup === 'transfer') {
        const fromAccount = getField(row, ['from account', 'from_account', 'from', 'from account name', 'from_account_name']);
        const toAccount = getField(row, ['to account', 'to_account', 'to', 'to account name', 'to_account_name']);
        if (!amount || !parsedDate || !fromAccount || !toAccount) {
          results.transfers.failed += 1;
          results.transfers.errors.push({ row: lineNumber, error: 'Missing required transfer fields: amount, date, from account, to account' });
          continue;
        }

        const fromAccountId = await getOrCreateAccount(fromAccount);
        const toAccountId = await getOrCreateAccount(toAccount);
        if (!fromAccountId || !toAccountId) {
          results.transfers.failed += 1;
          results.transfers.errors.push({ row: lineNumber, error: 'Unable to resolve transfer accounts' });
          continue;
        }

        try {
          await query(
            'INSERT INTO transfers (id, user_id, from_account_id, to_account_id, amount, description, transfer_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)',
            [uuidv4(), userId, fromAccountId, toAccountId, amount, description || null, parsedDate]
          );
          await query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromAccountId]);
          await query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toAccountId]);
          results.transfers.successful += 1;
        } catch (error) {
          results.transfers.failed += 1;
          results.transfers.errors.push({ row: lineNumber, error: error.message });
        }

        continue;
      }

      const category = getField(row, ['category', 'category name', 'subcategory', 'sub category', 'sub_category', 'sub-category']);
      const subcategory = getField(row, ['subcategory', 'sub category', 'sub_category', 'sub-category']);
      const accountName = getField(row, ['account', 'account name']);

      if (!amount || !parsedDate || !category) {
        const target = categoryGroup === 'income' ? results.income : results.expenses;
        target.failed += 1;
        target.errors.push({ row: lineNumber, error: 'Missing required fields: amount, date, or category' });
        continue;
      }

      const accountId = await getOrCreateAccount(accountName);
      if (!accountId) {
        const target = categoryGroup === 'income' ? results.income : results.expenses;
        target.failed += 1;
        target.errors.push({ row: lineNumber, error: `Account "${accountName || 'unspecified'}" not found` });
        continue;
      }

      const maps = categoryGroup === 'income' ? incMaps : expMaps;
      let categoryId = maps.parents[String(category || '').trim().toLowerCase()];
      if (!categoryId) {
        categoryId = await ensureCategory(category, categoryGroup, maps, maps.childrenByParent);
        if (!categoryId) {
          const target = categoryGroup === 'income' ? results.income : results.expenses;
          target.failed += 1;
          target.errors.push({ row: lineNumber, error: `Category "${category}" not found` });
          continue;
        }
      }

      if (subcategory) {
        const normalizedParent = String(category || '').trim().toLowerCase();
        const parentId = maps.parents[normalizedParent];
        if (!parentId) {
          const target = categoryGroup === 'income' ? results.income : results.expenses;
          target.failed += 1;
          target.errors.push({ row: lineNumber, error: `Parent category "${category}" not found` });
          continue;
        }
        const childId = await ensureSubcategory(parentId, subcategory, categoryGroup, maps.childrenByParent);
        if (!childId) {
          const target = categoryGroup === 'income' ? results.income : results.expenses;
          target.failed += 1;
          target.errors.push({ row: lineNumber, error: `Subcategory "${subcategory}" not found under ${category}` });
          continue;
        }
        categoryId = childId;
      }

      try {
        if (categoryGroup === 'expense') {
          await query(
            'INSERT INTO expenses (id, user_id, account_id, category_id, amount, description, expense_date, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP)',
            [uuidv4(), userId, accountId, categoryId, amount, description || null, parsedDate]
          );
          await query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, accountId]);
          results.expenses.successful += 1;
        } else {
          await query(
            'INSERT INTO incomes (id, user_id, account_id, category_id, amount, description, income_date, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP)',
            [uuidv4(), userId, accountId, categoryId, amount, description || null, parsedDate]
          );
          await query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, accountId]);
          results.income.successful += 1;
        }
      } catch (error) {
        const target = categoryGroup === 'income' ? results.income : results.expenses;
        target.failed += 1;
        target.errors.push({ row: lineNumber, error: error.message });
      }
    }

    res.json({
      success: true,
      data: {
        expenses: results.expenses,
        income: results.income,
        transfers: results.transfers,
        inferredFallback,
      },
    });
  } catch (error) {
    console.error('Import all error:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing data',
      error: error.message,
    });
  }
}

module.exports = {
  importAll,
};
