'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ tags, onChange, placeholder = 'Dodaj tag...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    // Učitaj sve postojeće tagove iz baze
    fetchAllTags()
  }, [])

  const fetchAllTags = async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (data.tags) {
        setAllTags(data.tags)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    }
  }

  const addTag = async (tag: string) => {
    if (!tag || tags.includes(tag)) return

    // Proveri da li tag već postoji u bazi, ako ne, kreiraj ga
    if (!allTags.includes(tag)) {
      try {
        const res = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag }),
        })
        if (res.ok) {
          const data = await res.json()
          setAllTags([...allTags, tag])
        }
      } catch (error) {
        console.error('Error creating tag:', error)
      }
    }

    onChange([...tags, tag])
    setInputValue('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSuggestionClick = (tag: string) => {
    if (!tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInputValue('')
  }

  const filteredSuggestions = inputValue.trim()
    ? allTags.filter(
        (tag) => tag.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(tag)
      )
    : []

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      removeTag(tag)
    } else {
      onChange([...tags, tag])
    }
  }

  return (
    <div className="w-full">
      {/* Prikaz selektovanih tagova */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#f9c344] text-[#1d1d1f] rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-[#1d1d1f]/10 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Prikaz svih postojećih tagova kao klikabilnih dugmića */}
      {allTags.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Kliknite na tag da ga selektujete:</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#f9c344] text-[#1d1d1f]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Input za dodavanje novih tagova */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9c344] focus:border-transparent"
        />
        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => addTag(inputValue.trim())}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <Plus size={18} className="text-gray-600" />
          </button>
        )}
        {filteredSuggestions.length > 0 && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 10).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSuggestionClick(tag)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

