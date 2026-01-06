import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
}

type TransformPictureRequest = {
  description: string
  imageDataUrl: string
}

type TransformPictureResponse =
  | {
      imageDataUrl: string
      transformed: boolean
    }
  | {
      message: string
    }

function parseBody(req: NextApiRequest): TransformPictureRequest {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  return {
    description: String(body?.description ?? ''),
    imageDataUrl: String(body?.imageDataUrl ?? ''),
  }
}

async function fetchImageUrlAsDataUrl(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download transformed image (${response.status})`)
  }

  const contentType = response.headers.get('content-type') || 'image/png'
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  return `data:${contentType};base64,${base64}`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransformPictureResponse>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' })
    return
  }

  const { description, imageDataUrl } = parseBody(req)

  if (!imageDataUrl) {
    res.status(400).json({ message: 'Missing imageDataUrl.' })
    return
  }

  const endpoint = process.env.CURSEDPHONE_TRANSFORM_API_URL
  const apiKey = process.env.CURSEDPHONE_TRANSFORM_API_KEY

  if (!endpoint) {
    res.status(200).json({ imageDataUrl, transformed: false })
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        description,
        prompt: description,
        image: imageDataUrl,
        imageDataUrl,
      }),
      signal: controller.signal,
    })

    if (!upstreamResponse.ok) {
      const text = await upstreamResponse.text().catch(() => '')
      res.status(502).json({
        message: `Transform API failed (${
          upstreamResponse.status
        }). ${text.slice(0, 500)}`,
      })
      return
    }

    const contentType = upstreamResponse.headers.get('content-type') || ''

    if (contentType.startsWith('image/')) {
      const arrayBuffer = await upstreamResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      res.status(200).json({
        imageDataUrl: `data:${contentType};base64,${base64}`,
        transformed: true,
      })
      return
    }

    if (contentType.includes('application/json')) {
      const json = (await upstreamResponse.json()) as Record<string, unknown>

      const candidate =
        (json.imageDataUrl as string) ||
        (json.image as string) ||
        (json.output as string) ||
        (json.url as string) ||
        (json.imageUrl as string)

      if (
        typeof candidate === 'string' &&
        candidate.startsWith('data:image/')
      ) {
        res.status(200).json({ imageDataUrl: candidate, transformed: true })
        return
      }

      if (typeof candidate === 'string' && /^https?:\/\//.test(candidate)) {
        const imageDataUrl = await fetchImageUrlAsDataUrl(candidate)
        res.status(200).json({ imageDataUrl, transformed: true })
        return
      }

      res.status(502).json({
        message:
          'Transform API returned JSON but no supported image field (expected imageDataUrl/data-url or imageUrl).',
      })
      return
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    res.status(200).json({
      imageDataUrl: `data:image/png;base64,${base64}`,
      transformed: true,
    })
  } catch (error) {
    console.error(error)
    res.status(502).json({ message: 'Error calling transform API.' })
  } finally {
    clearTimeout(timeout)
  }
}
