import React, { useState, useEffect, useRef, useMemo } from 'react'
import tagService from '../services/tagService'

const TagSelector = ({ 
  selectedTagIds = [], 
  onTagsChange, 
  placeholder = "Chọn tags..."
}) => {
  const [tags, setTags] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Gọi API lấy tags từ server
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true)
        const response = await tagService.getAllTags()
        const data = response?.data?.data || response?.data || []
        setTags(data)
      } catch (err) {
        console.error("Failed to fetch tags", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTags()
  }, [])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredTags = useMemo(() => {
    if (searchKeyword.trim()) {
      return tags.filter(tag =>
        tag.name.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }
    return tags
  }, [searchKeyword, tags])

  const handleTagToggle = (tagId) => {
    const newSelectedTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId]
    onTagsChange(newSelectedTagIds)
  }

  const handleRemoveTag = (tagId, e) => {
    e.stopPropagation()
    const newSelectedTagIds = selectedTagIds.filter(id => id !== tagId)
    onTagsChange(newSelectedTagIds)
  }

  const getSelectedTags = () => {
    return tags.filter(tag => selectedTagIds.includes(tag.id))
  }

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value)
  }

  const clearSearch = () => {
    setSearchKeyword('')
  }

  return (
    <div className="tag-selector" ref={dropdownRef}>
      <div 
        className={`tag-selector-input ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-tags">
          {getSelectedTags().length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            getSelectedTags().map(tag => (
              <span 
                key={tag.id} 
                className="selected-tag"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  type="button"
                  className="remove-tag"
                  onClick={(e) => handleRemoveTag(tag.id, e)}
                  aria-label={`Xóa tag ${tag.name}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="selector-arrow">
          <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </div>
      </div>

      {isOpen && (
        <div className="tag-dropdown">
          {/* Search */}
          <div className="tag-search">
            <div className="search-input-group">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm tags..."
                value={searchKeyword}
                onChange={handleSearchChange}
                className="search-input"
                autoFocus
              />
              {searchKeyword && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={clearSearch}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Tag list */}
          <div className="tags-dropdown-list">
            {isLoading ? (
              <div className="loading-item">Đang tải...</div>
            ) : filteredTags.length === 0 ? (
              <div className="empty-item">
                {searchKeyword ? 'Không tìm thấy tag nào' : 'Chưa có tag nào'}
              </div>
            ) : (
              filteredTags.map(tag => (
                <div
                  key={tag.id}
                  className={`tag-option ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag.id)}
                >
                  <div className="tag-option-content">
                    <span 
                      className="tag-color-dot"
                      style={{ backgroundColor: tag.color }}
                    ></span>
                    <span className="tag-name">{tag.name}</span>
                    {tag.description && (
                      <span className="tag-description">{tag.description}</span>
                    )}
                  </div>
                  {selectedTagIds.includes(tag.id) && (
                    <i className="bi bi-check-lg tag-check"></i>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="tag-dropdown-footer">
            <div className="selected-count">
              {selectedTagIds.length} tag được chọn
            </div>
            {selectedTagIds.length > 0 && (
              <button
                type="button"
                className="clear-all-btn"
                onClick={() => onTagsChange([])}
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TagSelector
