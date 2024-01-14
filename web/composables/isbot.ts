import { isbot } from "isbot";
import { usePageContext } from "~/composables/page-context";

// currently unused
export function isBot() {
  return isbot(usePageContext().server?.requestHeaders['user-agent'] ?? navigator.userAgent)
}
