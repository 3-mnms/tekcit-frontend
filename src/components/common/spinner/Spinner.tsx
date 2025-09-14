const Spinner = () => {
  return (
    // <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[99999]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground text-sm">로딩 중...</p>
      </div>
    </div>
  )
}

export default Spinner;