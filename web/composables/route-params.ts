import { ref, watch } from 'vue'
import { useRoute, RouteParams } from 'vue-router';

/**
 * Workaround for Vue bug where components rerender upon leaving the route
 * see https://github.com/vuejs/vue-router/issues/3393#issuecomment-1158470149
*/
export const useRouteParams = () => {
  const route = useRoute()

  const validRoutePath = route.path
  const params = ref<RouteParams>()
  watch(() => route.params, newParams => {
    if (route.path != validRoutePath) {
      console.warn('Route params changed before component was unmounted, skipping param update')
      return
    }
    params.value = newParams
  }, {
    immediate: true,
    flush: 'post',
  })

  return params
}
