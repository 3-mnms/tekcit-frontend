import React from 'react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Error Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-l-4 border-blue-500 p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div>
                <h1 className="text-6xl font-bold text-blue-600 mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-900">페이지를 찾을 수 없습니다</h2>
              </div>

              <p className="text-gray-600 leading-relaxed">
                요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. URL을 다시 확인해 주세요.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <a href="/" className="block">
            <button className="w-full bg-blue-600 text-white py-3 text-base font-medium">
              <span className="mr-2">🏠</span>
              홈으로 돌아가기
            </button>
          </a>

          <button
            // variant="outline"
            className="w-full py-3 text-base font-medium border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
            onClick={() => window.history.back()}
          >
            <span className="mr-2">←</span>
            이전 페이지로
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">도움이 필요하신가요?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span>브라우저의 뒤로가기 버튼을 사용해보세요</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span>URL 주소를 다시 확인해보세요</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span>홈페이지에서 원하는 페이지를 찾아보세요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
