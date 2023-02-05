import { ref, onMounted, defineComponent } from 'vue'

export default defineComponent({
  setup(_, { slots }) {
    const mounted = ref(false)
    onMounted(() => { mounted.value = true })
    return () => {
      if (mounted.value && slots.default) {
        return slots.default()
      }
      if (slots.placeholder) {
        return slots.placeholder()
      }
    }
  }
})
