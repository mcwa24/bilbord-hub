import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export function generateHTMLPreview(release: {
  title: string;
  content: string;
  company_name: string;
  published_at: string | null;
  alt_texts: { image_url: string; alt_text: string }[];
}): string {
  const date = release.published_at ? formatDate(release.published_at) : formatDate(new Date())
  
  return `
<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${release.title}</title>
</head>
<body>
  <article>
    <header>
      <h1>${release.title}</h1>
      <p><strong>Kompanija:</strong> ${release.company_name}</p>
      <p><strong>Datum:</strong> ${date}</p>
    </header>
    <div>
      ${release.content}
    </div>
  </article>
</body>
</html>
  `.trim()
}

export function generateReadyToPublishHTML(release: {
  title: string;
  content: string;
  company_name: string;
  alt_texts: { image_url: string; alt_text: string }[];
}): string {
  let html = `<h2>${release.title}</h2>\n`
  html += `<p><em>${release.company_name}</em></p>\n\n`
  
  // Process content and replace images with alt texts
  let processedContent = release.content
  release.alt_texts.forEach(({ image_url, alt_text }) => {
    const imgRegex = new RegExp(`<img[^>]*src=["']${image_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi')
    processedContent = processedContent.replace(imgRegex, (match) => {
      if (match.includes('alt=')) {
        return match.replace(/alt=["'][^"']*["']/, `alt="${alt_text}"`)
      }
      return match.replace('>', ` alt="${alt_text}">`)
    })
  })
  
  html += processedContent
  return html
}

