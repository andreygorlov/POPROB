import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for creating custom fields
const createCustomFieldSchema = z.object({
  name: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'BOOLEAN', 'EMAIL', 'PHONE', 'URL', 'TEXTAREA']),
  entityType: z.enum(['USER', 'CONTACT', 'COMPANY', 'SUPPLIER', 'EMPLOYEE', 'PROJECT', 'TASK']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  order: z.number().default(0),
  description: z.string().optional(),
  clientId: z.string().default('default')
})

// Schema for updating custom field values
const updateFieldValueSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(['USER', 'CONTACT', 'COMPANY', 'SUPPLIER', 'EMPLOYEE', 'PROJECT', 'TASK']),
  customFieldId: z.string(),
  value: z.any(), // JSON value
  clientId: z.string().default('default')
})

// GET /api/custom-fields - Get all custom fields for an entity type
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType') as any
    const clientId = searchParams.get('clientId') || 'default'

    if (!entityType) {
      return NextResponse.json({ error: 'Entity type is required' }, { status: 400 })
    }

    const customFields = await prisma.customField.findMany({
      where: {
        entityType,
        clientId,
        isActive: true
      },
      orderBy: { order: 'asc' },
      include: {
        values: true
      }
    })

    return NextResponse.json({ customFields })
  } catch (error) {
    console.error('Error fetching custom fields:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/custom-fields - Create a new custom field
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createCustomFieldSchema.parse(body)

    // Check if field name already exists for this entity type
    const existingField = await prisma.customField.findFirst({
      where: {
        name: validatedData.name,
        entityType: validatedData.entityType,
        clientId: validatedData.clientId
      }
    })

    if (existingField) {
      return NextResponse.json({ error: 'Field name already exists for this entity type' }, { status: 400 })
    }

    const customField = await prisma.customField.create({
      data: {
        ...validatedData,
        options: validatedData.options ? JSON.stringify(validatedData.options) : null
      }
    })

    return NextResponse.json({ customField }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating custom field:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/custom-fields - Update a custom field
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, values, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Field ID is required' }, { status: 400 })
    }

    // Filter out fields that shouldn't be updated directly
    const allowedFields = ['name', 'label', 'type', 'entityType', 'options', 'required', 'order', 'description', 'isActive']
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    )

    const customField = await prisma.customField.update({
      where: { id },
      data: {
        ...filteredData,
        options: filteredData.options ? JSON.stringify(filteredData.options) : undefined
      }
    })

    return NextResponse.json({ customField })
  } catch (error) {
    console.error('Error updating custom field:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/custom-fields - Delete a custom field
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Field ID is required' }, { status: 400 })
    }

    // Soft delete by setting isActive to false
    await prisma.customField.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Custom field deleted successfully' })
  } catch (error) {
    console.error('Error deleting custom field:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
