<template>
  <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ formatValue(value) }}</p>
        <p v-if="subtext" class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ subtext }}</p>
      </div>
      <div :class="color" class="p-3 rounded-lg">
        <span class="text-white text-2xl">{{ icon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/lib/utils'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  subtext: {
    type: String,
  },
  color: {
    type: String,
    default: 'bg-lavender-500',
  },
  isCurrency: {
    type: Boolean,
    default: true,
  },
})

const formatValue = (value) => {
  if (props.isCurrency) {
    return formatCurrency(value)
  }
  return value
}
</script>