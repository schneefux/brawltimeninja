import { ref, watch } from 'vue'
import { useRoute, RouteParams } from 'vue-router';

/**
 * Workaround for vue bug where components rerender upon leaving the route
 * see https://github.com/vuejs/vue-router/issues/3393#issuecomment-1158470149
*/
export const useRouteParams = () => {
  const route = useRoute()

  const params = ref<RouteParams>()
  watch(() => route.params, newParams => params.value = newParams, {
    immediate: true,
    flush: 'post',
  })

  return params
}
