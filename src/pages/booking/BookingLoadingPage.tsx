const BookingLoadingPage=()=>{
    return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">로딩 중...</p>
      </div>
    </div>
  )
}

export default BookingLoadingPage;