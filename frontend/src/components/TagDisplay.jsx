import React, { useState, useEffect } from 'react'
import tagService from '../services/tagService'

const TagDisplay = ({ tagIds = [], size = 'normal', className = '' }) => {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tagIds && tagIds.length > 0) {
      loadTags()
    } else {
      setTags([])
    }
  }, [tagIds])

  const loadTags = async () => {
    try {
      setLoading(true)
      // Get all tags and filter by IDs
      const response = await tagService.getAllTags()
      const allTags = response.data || response
      const filteredTags = allTags.filter(tag => tagIds.includes(tag.id))
      setTags(filteredTags)
    } catch (error) {
      console.error('Error loading tags for display:', error)
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="tags-loading">Đang tải tags...</div>
  }

  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className={`tags-container ${className}`}>
      {tags.map(tag => (
        <span 
          key={tag.id} 
          className={`tag-display ${size === 'small' ? 'small' : ''}`}
          style={{ backgroundColor: tag.color }}
          title={tag.description || tag.name}
        >
          <i className="bi bi-tag me-1"></i>
          {tag.name}
        </span>
      ))}
    </div>
  )
}

export default TagDisplay
