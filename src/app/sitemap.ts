import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://r-ramadhan.vercel.app'
    const lastModified = new Date()

    const routes = [
        '',
        '/calendar',
        '/charity',
        '/dashboard',
        '/duas',
        '/health',
        '/names',
        '/nearby',
        '/plan',
        '/qibla',
        '/quiz',
        '/quran',
        '/settings',
        '/tasbih',
        '/zakat',
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified,
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }))
}
