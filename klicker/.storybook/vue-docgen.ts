// FIXME adds try-catch to https://github.com/storybookjs/storybook/blob/next/code/frameworks/vue3-vite/src/plugins/vue-docgen.ts
// workaround for https://github.com/vue-styleguidist/vue-styleguidist/issues/1162
import { parse } from 'vue-docgen-api';
import type { PluginOption } from 'vite';
import { createFilter } from 'vite';
import MagicString from 'magic-string';

export function vueDocgen(): PluginOption {
  const include = /\.(vue)$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:vue-docgen-plugin',

    async transform(src: string, id: string) {
      if (!filter(id)) return undefined;

      try {
        const metaData = await parse(id);
        const metaSource = JSON.stringify(metaData);
        const s = new MagicString(src);
        s.append(`;_sfc_main.__docgenInfo = ${metaSource}`);

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true, source: id }),
        };
      } catch (e) {
        console.warn('vue-docgen-api error', id, e);
        return undefined;
      }
    },
  };
}
