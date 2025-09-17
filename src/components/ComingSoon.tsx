export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
          功能開發中
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          此功能正在建置中，敬請期待
        </p>
      </div>
    </div>
  )
}