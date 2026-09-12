import React from 'react';

export default function About() {
  return (
    <div className="max-w-4xl p-8 mx-auto mt-4">
      <h2 className="text-4xl font-serif font-bold mb-10 text-[#56494C] dark:text-[#EAE7E1] border-b-2 border-[#A599B5]/30 dark:border-[#A599B5]/20 pb-4">
        About This Platform
      </h2>
      
      <div className="prose prose-lg text-[#56494C] dark:text-[#EAE7E1] leading-relaxed space-y-8">
        <p className="text-xl font-medium text-[#5B7553] dark:text-[#7EA873]">
          Welcome to your new cloud-native Developer CMS and Portfolio Platform.
        </p>

        <div>
          <h3 className="text-2xl font-serif font-bold mb-3 text-[#56494C] dark:text-[#EAE7E1]">The Purpose</h3>
          <p>
            This platform is designed to give developers a seamless, distraction-free environment to write, publish, and manage their technical articles and personal brand. It strips away the bloat of traditional content management systems and provides exactly what you need: a powerful editor, a tagging engine for categorization, and a clean, accessible public feed.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-bold mb-3 text-[#56494C] dark:text-[#EAE7E1]">How to Navigate</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Feed:</strong> This is the public-facing side of your platform. Visitors will see all your published articles here, and can filter them by topic tags.
            </li>
            <li>
              <strong>Dashboard:</strong> Your personal command center. Here you can see a list of all your articles (both published and drafts), and you can edit or delete them as needed.
            </li>
            <li>
              <strong>Write an Article (Editor):</strong> Your creative workspace. Use the rich-text editor to draft your content, add images, assign tags, and toggle the visibility to publish it live to your feed.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-bold mb-3 text-[#56494C] dark:text-[#EAE7E1]">The Technology</h3>
          <p>
            Under the hood, this platform is powered by a modern decoupled architecture. The frontend is built with React and Tailwind CSS for a fast, responsive user interface. The backend utilizes a robust Node.js API to securely manage data mutations and cloud media uploads, all backed by a scalable PostgreSQL database hosted on Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
