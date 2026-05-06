const { query } = require('../lib/database.cjs');
const { v4: uuidv4 } = require('uuid');

async function getAllIncomeCategories(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT id, user_id, name, icon, color, is_active, created_at
       FROM income_categories
       WHERE user_id = $1 AND is_active = true
       ORDER BY name ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get income categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income categories',
    });
  }
}

async function getAllExpenseCategories(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT id, user_id, name, icon, color, is_active, created_at
       FROM expense_categories
       WHERE user_id = $1 AND is_active = true
       ORDER BY name ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get expense categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense categories',
    });
  }
}

async function createIncomeCategory(req, res) {
  try {
    const userId = req.user.id;
    const { name, icon, color, parentCategoryId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const id = uuidv4();
    const result = await query(
      `INSERT INTO income_categories (id, user_id, name, icon, color, parent_category_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, user_id, name, icon, color, parent_category_id, is_active, created_at`,
      [id, userId, name, icon, color, parentCategoryId || null]
    );

    res.status(201).json({
      success: true,
      message: 'Income category created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create income category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create income category',
    });
  }
}

async function createExpenseCategory(req, res) {
  try {
    const userId = req.user.id;
    const { name, icon, color, parentCategoryId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const id = uuidv4();
    const result = await query(
      `INSERT INTO expense_categories (id, user_id, name, icon, color, parent_category_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, user_id, name, icon, color, parent_category_id, is_active, created_at`,
      [id, userId, name, icon, color, parentCategoryId || null]
    );

    res.status(201).json({
      success: true,
      message: 'Expense category created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create expense category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense category',
    });
  }
}

async function updateIncomeCategory(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const result = await query(
      `UPDATE income_categories
       SET name = COALESCE($1, name),
           icon = COALESCE($2, icon),
           color = COALESCE($3, color)
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, name, icon, color, is_active, created_at`,
      [name, icon, color, id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Income category not found',
      });
    }

    res.json({
      success: true,
      message: 'Income category updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update income category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update income category',
    });
  }
}

async function updateExpenseCategory(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const result = await query(
      `UPDATE expense_categories
       SET name = COALESCE($1, name),
           icon = COALESCE($2, icon),
           color = COALESCE($3, color)
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, name, icon, color, is_active, created_at`,
      [name, icon, color, id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Expense category not found',
      });
    }

    res.json({
      success: true,
      message: 'Expense category updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update expense category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense category',
    });
  }
}

async function deleteIncomeCategory(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      'SELECT id FROM income_categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Income category not found',
      });
    }

    await query(
      'UPDATE income_categories SET is_active = false WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Income category deleted successfully',
    });
  } catch (error) {
    console.error('Delete income category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete income category',
    });
  }
}

async function deleteExpenseCategory(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      'SELECT id FROM expense_categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Expense category not found',
      });
    }

    await query(
      'UPDATE expense_categories SET is_active = false WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Expense category deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense category',
    });
  }
}

async function getIncomeCategoriesHierarchy(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT id, user_id, name, icon, color, parent_category_id, is_active, created_at
       FROM income_categories
       WHERE user_id = $1 AND is_active = true
       ORDER BY parent_category_id NULLS FIRST, name ASC`,
      [userId]
    );

    // Build hierarchy: parents with subcategories
    const categories = result.rows;
    const hierarchy = {};
    const subcategories = {};

    // First pass: organize by parent
    for (const cat of categories) {
      if (cat.parent_category_id) {
        if (!subcategories[cat.parent_category_id]) {
          subcategories[cat.parent_category_id] = [];
        }
        subcategories[cat.parent_category_id].push(cat);
      } else {
        hierarchy[cat.id] = cat;
      }
    }

    // Second pass: attach subcategories to parents
    const hierarchyArray = Object.values(hierarchy).map((parent) => ({
      ...parent,
      subcategories: subcategories[parent.id] || [],
    }));

    res.json({
      success: true,
      data: hierarchyArray,
    });
  } catch (error) {
    console.error('Get income categories hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income categories',
    });
  }
}

async function getExpenseCategoriesHierarchy(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT id, user_id, name, icon, color, parent_category_id, is_active, created_at
       FROM expense_categories
       WHERE user_id = $1 AND is_active = true
       ORDER BY parent_category_id NULLS FIRST, name ASC`,
      [userId]
    );

    // Build hierarchy: parents with subcategories
    const categories = result.rows;
    const hierarchy = {};
    const subcategories = {};

    // First pass: organize by parent
    for (const cat of categories) {
      if (cat.parent_category_id) {
        if (!subcategories[cat.parent_category_id]) {
          subcategories[cat.parent_category_id] = [];
        }
        subcategories[cat.parent_category_id].push(cat);
      } else {
        hierarchy[cat.id] = cat;
      }
    }

    // Second pass: attach subcategories to parents
    const hierarchyArray = Object.values(hierarchy).map((parent) => ({
      ...parent,
      subcategories: subcategories[parent.id] || [],
    }));

    res.json({
      success: true,
      data: hierarchyArray,
    });
  } catch (error) {
    console.error('Get expense categories hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense categories',
    });
  }
}

module.exports = {
  getAllIncomeCategories,
  getAllExpenseCategories,
  createIncomeCategory,
  createExpenseCategory,
  updateIncomeCategory,
  updateExpenseCategory,
  deleteIncomeCategory,
  deleteExpenseCategory,
  getIncomeCategoriesHierarchy,
  getExpenseCategoriesHierarchy,
};
