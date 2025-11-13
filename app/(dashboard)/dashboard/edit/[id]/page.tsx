'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { PRRelease } from '@/types'
import toast from 'react-hot-toast'

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    content: string;
    company_name: string;
    industry: string;
    tags: string;
    thumbnail_url: string;
    seo_meta_description: string;
    material_links: Array<{
      type: 'google_drive' | 'dropbox' | 'wetransfer' | 'press_room' | 'other';
      url: string;
      label: string;
    }>;
    alt_texts: Array<{ image_url: string; alt_text: string }>;
  }>({
    title: '',
    description: '',
    content: '',
    company_name: '',
    industry: '',
    tags: '',
    thumbnail_url: '',
    seo_meta_description: '',
    material_links: [{ type: 'google_drive', url: '', label: '' }],
    alt_texts: [{ image_url: '', alt_text: '' }],
  })

  useEffect(() => {
    fetchRelease()
  }, [params.id])

  const fetchRelease = async () => {
    try {
      const res = await fetch(`/api/releases/${params.id}`)
      const data = await res.json()
      const release: PRRelease = data.release

      setFormData({
        title: release.title,
        description: release.description,
        content: release.content,
        company_name: release.company_name,
        industry: release.industry,
        tags: release.tags.join(', '),
        thumbnail_url: release.thumbnail_url || '',
        seo_meta_description: release.seo_meta_description,
        material_links: release.material_links.length > 0 
          ? release.material_links.map(link => ({
              type: link.type as 'google_drive' | 'dropbox' | 'wetransfer' | 'press_room' | 'other',
              url: link.url,
              label: link.label
            }))
          : [{ type: 'google_drive' as const, url: '', label: '' }],
        alt_texts: release.alt_texts.length > 0 
          ? release.alt_texts 
          : [{ image_url: '', alt_text: '' }],
      })
    } catch (error) {
      toast.error('Greška pri učitavanju saopštenja')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      const materialLinks = formData.material_links.filter(l => l.url && l.label)
      const altTexts = formData.alt_texts.filter(a => a.image_url && a.alt_text)

      const res = await fetch(`/api/releases/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags,
          material_links: materialLinks,
          alt_texts: altTexts,
        }),
      })

      if (res.ok) {
        toast.success('Saopštenje ažurirano!')
        router.push('/dashboard')
      } else {
        throw new Error('Greška pri ažuriranju')
      }
    } catch (error) {
      toast.error('Greška pri ažuriranju saopštenja')
    } finally {
      setSaving(false)
    }
  }

  const addMaterialLink = () => {
    setFormData({
      ...formData,
      material_links: [...formData.material_links, { type: 'google_drive', url: '', label: '' }],
    })
  }

  const removeMaterialLink = (index: number) => {
    setFormData({
      ...formData,
      material_links: formData.material_links.filter((_, i) => i !== index),
    })
  }

  const updateMaterialLink = (index: number, field: string, value: any) => {
    const updated = [...formData.material_links]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, material_links: updated })
  }

  const addAltText = () => {
    setFormData({
      ...formData,
      alt_texts: [...formData.alt_texts, { image_url: '', alt_text: '' }],
    })
  }

  const removeAltText = (index: number) => {
    setFormData({
      ...formData,
      alt_texts: formData.alt_texts.filter((_, i) => i !== index),
    })
  }

  const updateAltText = (index: number, field: string, value: string) => {
    const updated = [...formData.alt_texts]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, alt_texts: updated })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom">
          <p className="text-gray-600">Učitavanje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Izmeni saopštenje
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Naslov *
            </label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Naslov saopštenja"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Kratak opis *
            </label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kratak opis saopštenja"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Sadržaj (HTML) *
            </label>
            <Textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="HTML sadržaj saopštenja"
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
                Naziv kompanije *
              </label>
              <Input
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Naziv kompanije"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
                Industrija *
              </label>
              <Input
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Tip industrije"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Tagovi (odvojeni zarezom)
            </label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Thumbnail URL
            </label>
            <Input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              SEO Meta opis
            </label>
            <Textarea
              value={formData.seo_meta_description}
              onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value })}
              placeholder="SEO opis za pretraživače"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-[#1d1d1f]">
                Linkovi ka materijalima
              </label>
              <Button type="button" variant="outline" onClick={addMaterialLink}>
                + Dodaj link
              </Button>
            </div>
            {formData.material_links.map((link, index) => (
              <div key={index} className="grid md:grid-cols-4 gap-4 mb-4">
                <select
                  value={link.type}
                  onChange={(e) => updateMaterialLink(index, 'type', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="google_drive">Google Drive</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="wetransfer">WeTransfer</option>
                  <option value="press_room">Press Room</option>
                  <option value="other">Ostalo</option>
                </select>
                <Input
                  value={link.url}
                  onChange={(e) => updateMaterialLink(index, 'url', e.target.value)}
                  placeholder="URL"
                />
                <Input
                  value={link.label}
                  onChange={(e) => updateMaterialLink(index, 'label', e.target.value)}
                  placeholder="Label"
                />
                {formData.material_links.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeMaterialLink(index)}
                  >
                    Obriši
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-[#1d1d1f]">
                Alt tekstovi za slike
              </label>
              <Button type="button" variant="outline" onClick={addAltText}>
                + Dodaj alt tekst
              </Button>
            </div>
            {formData.alt_texts.map((alt, index) => (
              <div key={index} className="grid md:grid-cols-3 gap-4 mb-4">
                <Input
                  value={alt.image_url}
                  onChange={(e) => updateAltText(index, 'image_url', e.target.value)}
                  placeholder="URL slike"
                />
                <Input
                  value={alt.alt_text}
                  onChange={(e) => updateAltText(index, 'alt_text', e.target.value)}
                  placeholder="Alt tekst"
                />
                {formData.alt_texts.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeAltText(index)}
                  >
                    Obriši
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Čuvanje...' : 'Sačuvaj izmene'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Otkaži
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

