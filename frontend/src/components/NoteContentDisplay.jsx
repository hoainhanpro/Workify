import React from 'react'
import '../styles/RichTextEditor.css'

const NoteContentDisplay = ({ content, isPreview = false }) => {
  if (!content) return null

  // Nếu là preview, chỉ hiển thị text thuần
  if (isPreview) {
    const stripHtmlTags = (html) => {
      const tmp = document.createElement('div')
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ''
    }
    return <span>{stripHtmlTags(content)}</span>
  }

  // Hiển thị full HTML content (dùng cho modal hoặc detail view)
  return (
    <div 
      className="note-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

export default NoteContentDisplay
