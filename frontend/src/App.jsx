import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Editor from './components/Editor'
import Feed from './components/Feed'
import About from './components/About'
import PostDetail from './components/PostDetail'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('feed')
  const [postToEdit, setPostToEdit] = useState(null)
  const [viewingPostId, setViewingPostId] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleEdit = (post) => {
    setPostToEdit(post)
    setCurrentView('editor')
  }

  const handleSave = () => {
    setPostToEdit(null)
    setCurrentView('dashboard')
  }

  const handleCancel = () => {
    setPostToEdit(null)
    setCurrentView('dashboard')
  }

  const handleViewPost = (id) => {
    setViewingPostId(id)
    setCurrentView('post')
    window.scrollTo(0, 0)
  }

  const handleTagClickFromPost = (tag) => {
    // When a user clicks a tag in the PostDetail view, send them to the feed with that tag in the URL
    const params = new URLSearchParams()
    params.set('tag', tag)
    window.history.pushState({}, '', `/?${params.toString()}`)
    setCurrentView('feed')
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-[#CDDDDD] dark:bg-[#121413] font-sans text-[#56494C] dark:text-[#EAE7E1] transition-colors duration-500">
      
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-[#121413]/70 backdrop-blur-lg border-b border-[#A599B5]/20 mb-8 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span 
                className="text-3xl font-serif font-black text-[#9f79d1] tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setCurrentView('feed')}
              >
                Console.blog
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentView('feed')} 
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  currentView === 'feed' 
                    ? 'bg-[#007EA7]/10 text-[#007EA7] dark:bg-[#007EA7]/20 dark:text-[#4DB8D9]' 
                    : 'text-[#56494C]/70 dark:text-[#EAE7E1]/70 hover:text-[#56494C] dark:hover:text-[#EAE7E1] hover:bg-[#A599B5]/15'
                }`}
              >
                Feed
              </button>
              <button 
                onClick={() => setCurrentView('dashboard')} 
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  currentView === 'dashboard' 
                    ? 'bg-[#007EA7]/10 text-[#007EA7] dark:bg-[#007EA7]/20 dark:text-[#4DB8D9]' 
                    : 'text-[#56494C]/70 dark:text-[#EAE7E1]/70 hover:text-[#56494C] dark:hover:text-[#EAE7E1] hover:bg-[#A599B5]/15'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('about')} 
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  currentView === 'about' 
                    ? 'bg-[#007EA7]/10 text-[#007EA7] dark:bg-[#007EA7]/20 dark:text-[#4DB8D9]' 
                    : 'text-[#56494C]/70 dark:text-[#EAE7E1]/70 hover:text-[#56494C] dark:hover:text-[#EAE7E1] hover:bg-[#A599B5]/15'
                }`}
              >
                About
              </button>

              {/* Dark Mode Toggle - using sage-green (#5B7553) as accent */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="ml-2 p-2 rounded-full text-[#5B7553] hover:bg-[#5B7553]/15 transition-colors focus:outline-none"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <button 
                onClick={() => { setPostToEdit(null); setCurrentView('editor'); }} 
                className={`ml-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md ${
                  currentView === 'editor' 
                    ? 'bg-[#007EA7] text-white' 
                    : 'bg-[#5B7553] text-white hover:bg-[#4A6143]'
                }`}
              >
                Write an Article
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-16">
        {currentView === 'feed' && <Feed onViewPost={handleViewPost} />}
        {currentView === 'dashboard' && <Dashboard onEdit={handleEdit} />}
        {currentView === 'about' && <About />}
        {currentView === 'post' && (
          <PostDetail 
            postId={viewingPostId} 
            onBack={() => setCurrentView('feed')} 
            onTagClick={handleTagClickFromPost} 
            onViewPost={handleViewPost}
          />
        )}
        {currentView === 'editor' && (
          <Editor 
            postToEdit={postToEdit} 
            onSave={handleSave} 
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  )
}

export default App;