import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Editor from './components/Editor'
import Feed from './components/Feed'
import About from './components/About'
import PostDetail from './components/PostDetail'
import Login from './components/Login'
import { useAuth } from './AuthContext'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('feed')
  const [postToEdit, setPostToEdit] = useState(null)
  const [viewingPostId, setViewingPostId] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (!user && (currentView === 'dashboard' || currentView === 'editor')) {
      setCurrentView('login')
    }
    // Close mobile menu on view change
    setIsMobileMenuOpen(false)
  }, [user, currentView])

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
    const params = new URLSearchParams()
    params.set('tag', tag)
    window.history.pushState({}, '', `/?${params.toString()}`)
    setCurrentView('feed')
    window.scrollTo(0, 0)
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen bg-[#CDDDDD] dark:bg-[#121413] font-sans text-[#56494C] dark:text-[#EAE7E1] transition-colors duration-500">
      
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-[#121413]/70 backdrop-blur-lg border-b border-[#A599B5]/20 mb-8 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span 
                className="text-2xl sm:text-3xl font-serif font-black text-[#9f79d1] tracking-tight cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
                onClick={() => setCurrentView('feed')}
              >
                Console.blog
              </span>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#56494C] dark:text-[#EAE7E1] hover:text-[#007EA7] dark:hover:text-[#4DB8D9] focus:outline-none p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
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
              
              {user && (
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
              )}
              
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
              
              {user ? (
                <>
                  <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[#A599B5]/30">
                    <div className="h-8 w-8 rounded-full bg-[#5B7553] text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user.email.charAt(0)}
                    </div>
                    <button 
                      onClick={() => signOut()} 
                      className="text-xs font-bold text-[#56494C]/60 dark:text-[#EAE7E1]/60 hover:text-red-500 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                  <button 
                    onClick={() => { setPostToEdit(null); setCurrentView('editor'); }} 
                    className={`ml-4 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md ${
                      currentView === 'editor' 
                        ? 'bg-[#007EA7] text-white' 
                        : 'bg-[#5B7553] text-white hover:bg-[#4A6143]'
                    }`}
                  >
                    Write an Article
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setCurrentView('login')} 
                  className={`ml-4 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md ${
                    currentView === 'login' 
                      ? 'bg-[#007EA7] text-white' 
                      : 'bg-[#5B7553] text-white hover:bg-[#4A6143]'
                  }`}
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#A599B5]/20 bg-white/95 dark:bg-[#121413]/95 backdrop-blur-lg">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
              <button 
                onClick={() => setCurrentView('feed')} 
                className={`w-full py-3 rounded-xl text-center text-sm font-bold transition-all ${
                  currentView === 'feed' 
                    ? 'bg-[#007EA7]/10 text-[#007EA7] dark:bg-[#007EA7]/20 dark:text-[#4DB8D9]' 
                    : 'text-[#56494C] dark:text-[#EAE7E1]'
                }`}
              >
                Feed
              </button>
              
              {user && (
                <button 
                  onClick={() => setCurrentView('dashboard')} 
                  className={`w-full py-3 rounded-xl text-center text-sm font-bold transition-all ${
                    currentView === 'dashboard' 
                      ? 'bg-[#007EA7]/10 text-[#007EA7] dark:bg-[#007EA7]/20 dark:text-[#4DB8D9]' 
                      : 'text-[#56494C] dark:text-[#EAE7E1]'
                }`}
                >
                  Dashboard
                </button>
              )}
              
              <button 
                onClick={() => setCurrentView('about')} 
                className={`w-full py-3 rounded-xl text-center text-sm font-bold transition-all ${
                  currentView === 'about' 
                    ? 'bg-[#007EA7]/10 text-[#007EA7] dark:bg-[#007EA7]/20 dark:text-[#4DB8D9]' 
                    : 'text-[#56494C] dark:text-[#EAE7E1]'
                }`}
              >
                About
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full py-3 rounded-xl flex justify-center items-center gap-2 text-sm font-bold text-[#5B7553]"
              >
                {isDarkMode ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Light Mode
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Dark Mode
                  </>
                )}
              </button>

              {user ? (
                <>
                  <button 
                    onClick={() => { setPostToEdit(null); setCurrentView('editor'); }} 
                    className="w-full py-3 mt-2 rounded-xl text-sm font-bold text-white bg-[#5B7553]"
                  >
                    Write an Article
                  </button>
                  <div className="w-full mt-4 pt-4 border-t border-[#A599B5]/20 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#5B7553] text-white flex items-center justify-center font-bold text-xs uppercase">
                        {user.email.charAt(0)}
                      </div>
                      <span className="text-sm text-[#56494C] dark:text-[#EAE7E1] font-medium">{user.email}</span>
                    </div>
                    <button 
                      onClick={() => signOut()} 
                      className="text-sm font-bold text-red-500/80 hover:text-red-500"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setCurrentView('login')} 
                  className="w-full py-3 mt-2 rounded-xl text-sm font-bold text-white bg-[#5B7553]"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pb-16 px-4 md:px-0">
        {currentView === 'feed' && <Feed onViewPost={handleViewPost} />}
        {currentView === 'dashboard' && user && <Dashboard onEdit={handleEdit} />}
        {currentView === 'about' && <About />}
        {currentView === 'login' && <Login onNavigate={handleNavigate} />}
        {currentView === 'post' && (
          <PostDetail 
            postId={viewingPostId} 
            onBack={() => setCurrentView('feed')} 
            onTagClick={handleTagClickFromPost} 
            onViewPost={handleViewPost}
          />
        )}
        {currentView === 'editor' && user && (
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
