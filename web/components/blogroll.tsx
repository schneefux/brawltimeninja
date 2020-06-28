import Vue, { PropType } from 'vue'

export default Vue.extend({
  functional: true,
  name: 'Blogroll',
  props: {
    topic: {
      type: String,
      required: true
    },
    posts: {
      type: Array as PropType<any>,
      required: true
    },
  },
  render(h, { props }) {
    return <div class="flex flex-wrap justify-center">
      { props.posts.map((post) =>
        <article
          key={post.id}
          class="card-wrapper w-full md:w-1/2 lg:w-1/3"
        >
          <div class="card bg-white h-full">
            <div class="card-content">
              <nuxt-link to={`/blog/${props.topic}/${post.id}`}>
                <img
                  v-show="'mode' in post"
                  class="h-6 float-right mx-2"
                  src={'mode' in post ? require(`~/assets/images/mode/icon/${post.mode.toLowerCase().replace(' ', '')}_optimized.png`) : ''}
                />
                <h3 class="card-header text-primary-dark">
                  { post.title }
                </h3>
              </nuxt-link>
              <p class="mt-2 text-grey-darkest">
                { post.description }
              </p>
            </div>
          </div>
        </article>
      ) }
    </div>
  }
})
