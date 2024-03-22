import { MaybeRef, unref } from "vue"

export const useDownload = (target: MaybeRef<string>, name?: MaybeRef<string>) => {
  const download = async () => {
    const url = unref(target)
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a')
    link.href = blobUrl
    const filename = unref(name) ?? url.split('\\').pop()?.split('/').pop() ?? '';
    link.download = filename
    document.body.appendChild(link)
    console.log(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(blobUrl)
  }
  return { download }
}
