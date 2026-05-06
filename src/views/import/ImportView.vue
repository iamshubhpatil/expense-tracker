<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
        <div class="space-y-6">
          <router-link
            to="/dashboard"
            class="flex items-center justify-between p-4 border-2 border-lavender-200 rounded-lg hover:bg-lavender-50 dark:hover:bg-gray-700 dark:border-lavender-700 transition bg-gradient-to-r from-lavender-50 dark:from-gray-700 to-transparent group"
          >
            <div>
              <h3 class="font-semibold text-gray-800 dark:text-white group-hover:text-lavender-600">← Back to Dashboard</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Return to your financial overview</p>
            </div>
          </router-link>

          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Import Data</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Import your financial data from CSV or Excel files</p>
          </div>

          <!-- Import Instructions -->
          <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p class="text-sm text-blue-800 dark:text-blue-200">
              <strong>📋 Supported Formats:</strong> CSV, Excel (XLSX). Please ensure your file contains the required columns: Date, Category, Amount, Description.
            </p>
          </div>

          <!-- Upload Area -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div
              @dragover.prevent="dragOver = true"
              @dragleave.prevent="dragOver = false"
              @drop.prevent="handleFileDrop"
              :class="['border-2 border-dashed rounded-lg p-12 text-center transition', dragOver ? 'border-lavender-500 bg-lavender-50 dark:bg-lavender-900' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600']"
            >
              <div class="text-4xl mb-4">📁</div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Drop your file here</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">or</p>
              <label class="inline-block">
                <input
                  type="file"
                  @change="handleFileSelect"
                  accept=".csv,.xlsx"
                  class="hidden"
                />
                <span class="bg-lavender-600 hover:bg-lavender-700 text-white px-4 py-2 rounded-lg cursor-pointer transition font-medium">
                  Browse Files
                </span>
              </label>
            </div>

            <!-- File Preview -->
            <div v-if="selectedFile" class="mt-6 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <span class="text-2xl">📄</span>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ selectedFile.name }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
                  </div>
                </div>
                <button
                  @click="clearFile"
                  class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          </div>

          <div v-if="selectedFile" class="bg-white dark:bg-gray-700 rounded-lg shadow p-6 space-y-4">
            <div v-if="previewErrors.length" class="p-3 bg-red-50 dark:bg-red-900 rounded">
              <p class="text-sm text-red-700 dark:text-red-200">Validation errors:</p>
              <ul class="list-disc list-inside text-sm text-red-700 dark:text-red-200">
                <li v-for="err in previewErrors" :key="err">{{ err }}</li>
              </ul>
            </div>

            <div v-if="previewAvailable" class="mt-4 p-3 bg-gray-50 dark:bg-gray-600 rounded">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Preview (first rows)</p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr>
                      <th v-for="(h, idx) in previewHeaders" :key="idx" class="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-200">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, ridx) in previewRows" :key="ridx" class="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-600">
                      <td v-for="(c, cidx) in r" :key="cidx" class="px-2 py-1 text-gray-800 dark:text-white">{{ c }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mb-3">
              <label class="flex items-center">
                <input type="checkbox" v-model="autoCreateMissing" class="rounded border-gray-300" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-create missing accounts and categories</span>
              </label>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="importData"
                :disabled="!canImport() || isImporting"
                class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
              >
                {{ isImporting ? 'Importing...' : '✅ Import Data' }}
              </button>
              <button
                @click="clearFile"
                class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Import History -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <div class="p-6 border-b border-gray-200 dark:border-gray-600">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Recent Imports</h2>
            </div>
            <div v-if="importHistory.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
              No import history yet
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">File Name</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Records</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in importHistory" :key="item.id" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ item.date }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ item.fileName }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ item.records }}</td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="['px-2 py-1 rounded text-xs font-medium', item.status === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200']">
                        {{ item.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'
import apiClient from '@/lib/api'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const selectedFile = ref(null)
const dragOver = ref(false)
const isImporting = ref(false)
// accounts removed — Import now relies on per-row Account column or server logic
const importHistory = ref([])

const parsedCsvData = ref('')
const previewAvailable = ref(false)
const previewHeaders = ref([])
const previewRows = ref([])
const previewErrors = ref([])

const autoCreateMissing = ref(false)

// importOptions removed

// Load import history from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem('importHistory')
  if (saved) {
    try {
      importHistory.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load import history from localStorage', e)
      importHistory.value = []
    }
  }
})

// Save import history to localStorage
const saveImportHistory = () => {
  try {
    // Keep only the last 50 imports to avoid localStorage bloat
    const limitedHistory = importHistory.value.slice(0, 50)
    localStorage.setItem('importHistory', JSON.stringify(limitedHistory))
  } catch (e) {
    console.error('Failed to save import history to localStorage', e)
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    generatePreview(file)
  }
}

const handleFileDrop = (event) => {
  dragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    selectedFile.value = file
    generatePreview(file)
  }
}

const clearFile = () => {
  selectedFile.value = null
  parsedCsvData.value = ''
  previewAvailable.value = false
  previewHeaders.value = []
  previewRows.value = []
  previewErrors.value = []
}

const canImport = () => {
  if (!selectedFile.value) return false
  if (previewErrors.value.length > 0) return false
  return true
}

const importData = async () => {
  if (!selectedFile.value || !parsedCsvData.value) return

  try {
    isImporting.value = true
    const resp = await apiClient.post('/import', {
      csvData: parsedCsvData.value,
      autoCreate: autoCreateMissing.value,
      fileName: selectedFile.value.name,
    })
    const exp = resp.data?.data?.expenses?.successful || 0
    const inc = resp.data?.data?.income?.successful || 0
    const transferCount = resp.data?.data?.transfers?.successful || 0
    const totalImported = Number(exp) + Number(inc) + Number(transferCount)
    const expErrors = resp.data?.data?.expenses?.errors || []
    const incErrors = resp.data?.data?.income?.errors || []
    const transferErrors = resp.data?.data?.transfers?.errors || []
    const allErrors = [...expErrors, ...incErrors, ...transferErrors]

    importHistory.value.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      fileName: selectedFile.value.name,
      records: totalImported,
      status: allErrors.length === 0 ? 'success' : allErrors.length === totalImported ? 'failed' : 'partial',
      errors: allErrors,
    })
    saveImportHistory()

    if (allErrors.length > 0) {
      const sample = allErrors.slice(0, 5).map((e) => `Row ${e.row}: ${e.error}`).join('\n')
      alert(`Imported ${totalImported} records; ${allErrors.length} failed. Sample errors:\n${sample}`)
    } else {
      alert(`Successfully imported ${totalImported} records!`)
    }
    clearFile()
  } catch (error) {
    console.error('Import failed', error)
    importHistory.value.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      fileName: selectedFile.value.name,
      records: 0,
      status: 'failed',
    })
    saveImportHistory()
    const serverMessage = error?.response?.data?.message || error?.message || 'Import failed. Please check your file format and try again.'
    alert(serverMessage)
  } finally {
    isImporting.value = false
  }
}

const parseFileToCsv = async (file) => {
  const name = (file.name || '').toLowerCase()
  const ext = name.split('.').pop()
  if (ext === 'csv') {
    return await file.text()
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_csv(sheet)
  }

  throw new Error('Unsupported file format')
}

const generatePreview = async (file) => {
  previewAvailable.value = false
  previewHeaders.value = []
  previewRows.value = []
  previewErrors.value = []
  parsedCsvData.value = ''

  try {
    const csvText = await parseFileToCsv(file)
    parsedCsvData.value = csvText

    const parsed = Papa.parse(csvText, {
      preview: 6,
      skipEmptyLines: true,
    })

    if (parsed.errors.length > 0) {
      previewErrors.value = parsed.errors.map((error) => error.message || 'Invalid file row')
      return
    }

    if (!parsed.data || parsed.data.length === 0) {
      previewErrors.value.push('File appears empty')
      return
    }

    const [headers, ...rows] = parsed.data
    previewHeaders.value = headers.map((h) => String(h || '').trim())
    previewRows.value = rows.slice(0, 5).map((row) => row.map((cell) => String(cell || '').trim()))

    const headerKeys = previewHeaders.value.map((h) => h.toLowerCase())
    const dateAliases = ['date', 'transaction date', 'transaction_date', 'expense_date', 'income_date', 'transfer_date']
    const categoryAliases = ['category', 'category name', 'subcategory', 'sub category', 'sub_category', 'sub-category']
    const amountAliases = ['amount', 'amt', 'value']

    const hasDate = dateAliases.some((alias) => headerKeys.includes(alias))
    const hasCategory = categoryAliases.some((alias) => headerKeys.includes(alias))
    const hasAmount = amountAliases.some((alias) => headerKeys.includes(alias))

    const missing = []
    if (!hasDate) missing.push('date')
    if (!hasAmount) missing.push('amount')
    if (!hasCategory) missing.push('category or subcategory')
    if (missing.length > 0) {
      previewErrors.value.push(`Missing required columns: ${missing.join(', ')}`)
    }

    previewAvailable.value = previewErrors.value.length === 0
  } catch (error) {
    previewErrors.value.push(error.message || 'Unable to parse file')
  }
}

// accounts/fetch removed — no longer needed
</script>