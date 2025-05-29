<template>
  <table class="min-w-full divide-y divide-gray-200">
    <tbody>
      <tr v-for="(val, key) in obj" :key="key" class="odd:bg-white even:bg-gray-50">
        <th class="px-4 py-2 text-left font-medium">{{ title || key }}</th>
        <td class="px-4 py-2">
          <span v-if="isPrimitive(val)">{{ val }}</span>
          <pre v-else>{{ JSON.stringify(val, null, 2) }}</pre>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'ProtoTable',
  props: {
    obj: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  methods: {
    isPrimitive(v) {
      return ['string', 'number', 'boolean'].includes(typeof v)
    },
  },
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  border: 1px solid #ddd;
}
pre {
  margin: 0;
  font-family: monospace;
}
</style>
