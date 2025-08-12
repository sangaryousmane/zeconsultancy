import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateJWT(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function getAuthUser(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null

    const decoded = await verifyJWT(token)
    if (!decoded) return null

    // Ensure userId is treated as string for MongoDB ObjectId
    const userId = String(decoded.userId)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verified: true,
      },
    })

    return user
  } catch {
    return null
  }
}

export async function getAuthenticatedUser(request?: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return null
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return null
    }
    
    // Ensure userId is treated as string for MongoDB ObjectId
    const userId = String(decoded.userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
      },
    })

    return user
  } catch (error) {
    return null
  }
}

export function requireAuth(roles?: string[]) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request)
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (roles && !roles.includes(user.role)) {
      return new Response('Forbidden', { status: 403 })
    }

    return user
  }
}