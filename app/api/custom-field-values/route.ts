import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for updating field values
const updateFieldValueSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(['USER', 'CONTACT', 'COMPANY', 'SUPPLIER', 'EMPLOYEE', 'PROJECT', 'TASK']),
  customFieldId: z.string(),
  value: z.any(), // JSON value (will be stringified)
  clientId: z.string().default('default')
})

// Schema for bulk updates
const bulkUpdateSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(['USER', 'CONTACT', 'COMPANY', 'SUPPLIER', 'EMPLOYEE', 'PROJECT', 'TASK']),
  values: z.array(z.object({
    customFieldId: z.string(),
    value: z.any()
  })),
  clientId: z.string().default('default')
})

// GET /api/custom-field-values - Get field values for an entity
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')
    const entityType = searchParams.get('entityType') as any
    const clientId = searchParams.get('clientId') || 'default'

    if (!entityId || !entityType) {
      return NextResponse.json({ error: 'Entity ID and type are required' }, { status: 400 })
    }

    const fieldValues = await prisma.customFieldValue.findMany({
      where: {
        entityId,
        entityType,
        clientId
      },
      include: {
        customField: true
      }
    })

    // Parse JSON values
    const parsedFieldValues = fieldValues.map(fv => ({
      ...fv,
      value: JSON.parse(fv.value)
    }))

    return NextResponse.json({ fieldValues: parsedFieldValues })
  } catch (error) {
    console.error('Error fetching field values:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/custom-field-values - Create or update field values
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = updateFieldValueSchema.parse(body)

    // Check if the custom field exists and is active
    const customField = await prisma.customField.findFirst({
      where: {
        id: validatedData.customFieldId,
        entityType: validatedData.entityType,
        clientId: validatedData.clientId,
        isActive: true
      }
    })

    if (!customField) {
      return NextResponse.json({ error: 'Custom field not found or inactive' }, { status: 404 })
    }

    // Parse options if they exist
    const options = customField.options ? JSON.parse(customField.options) : null
    
    // Validate value based on field type
    const validationError = validateFieldValue(validatedData.value, customField.type, options)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Upsert the field value
    const fieldValue = await prisma.customFieldValue.upsert({
      where: {
        entityId_entityType_customFieldId_clientId: {
          entityId: validatedData.entityId,
          entityType: validatedData.entityType,
          customFieldId: validatedData.customFieldId,
          clientId: validatedData.clientId
        }
      },
      update: {
        value: JSON.stringify(validatedData.value)
      },
      create: {
        entityId: validatedData.entityId,
        entityType: validatedData.entityType,
        customFieldId: validatedData.customFieldId,
        value: JSON.stringify(validatedData.value),
        clientId: validatedData.clientId
      },
      include: {
        customField: true
      }
    })

    return NextResponse.json({ fieldValue }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating/updating field value:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/custom-field-values - Bulk update field values
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const validatedData = bulkUpdateSchema.parse(body)

    // Get all custom fields for this entity type
    const customFields = await prisma.customField.findMany({
      where: {
        entityType: validatedData.entityType,
        clientId: validatedData.clientId,
        isActive: true
      }
    })

    const fieldMap = new Map(customFields.map(field => [field.id, field]))

    // Validate all values
    for (const { customFieldId, value } of validatedData.values) {
      const customField = fieldMap.get(customFieldId)
      if (!customField) {
        return NextResponse.json({ error: `Custom field ${customFieldId} not found` }, { status: 404 })
      }

      // Parse options if they exist
      const options = customField.options ? JSON.parse(customField.options) : null
      
      const validationError = validateFieldValue(value, customField.type, options)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }
    }

    // Bulk upsert all values
    const results = await Promise.all(
      validatedData.values.map(({ customFieldId, value }) =>
        prisma.customFieldValue.upsert({
          where: {
            entityId_entityType_customFieldId_clientId: {
              entityId: validatedData.entityId,
              entityType: validatedData.entityType,
              customFieldId,
              clientId: validatedData.clientId
            }
          },
          update: { value: JSON.stringify(value) },
          create: {
            entityId: validatedData.entityId,
            entityType: validatedData.entityType,
            customFieldId,
            value: JSON.stringify(value),
            clientId: validatedData.clientId
          }
        })
      )
    )

    return NextResponse.json({ fieldValues: results })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error bulk updating field values:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/custom-field-values - Delete field values
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')
    const entityType = searchParams.get('entityType') as any
    const customFieldId = searchParams.get('customFieldId')
    const clientId = searchParams.get('clientId') || 'default'

    if (!entityId || !entityType) {
      return NextResponse.json({ error: 'Entity ID and type are required' }, { status: 400 })
    }

    const whereClause: any = {
      entityId,
      entityType,
      clientId
    }

    if (customFieldId) {
      whereClause.customFieldId = customFieldId
    }

    await prisma.customFieldValue.deleteMany({
      where: whereClause
    })

    return NextResponse.json({ message: 'Field values deleted successfully' })
  } catch (error) {
    console.error('Error deleting field values:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to validate field values
function validateFieldValue(value: any, fieldType: string, options: any): string | null {
  switch (fieldType) {
    case 'TEXT':
    case 'TEXTAREA':
      if (typeof value !== 'string') return 'Value must be a string'
      break
    
    case 'NUMBER':
      if (typeof value !== 'number' && !Number.isFinite(Number(value))) {
        return 'Value must be a number'
      }
      break
    
    case 'DATE':
      if (typeof value !== 'string' || isNaN(Date.parse(value))) {
        return 'Value must be a valid date string'
      }
      break
    
    case 'BOOLEAN':
      if (typeof value !== 'boolean') return 'Value must be a boolean'
      break
    
    case 'EMAIL':
      if (typeof value !== 'string' || !value.includes('@')) {
        return 'Value must be a valid email address'
      }
      break
    
    case 'PHONE':
      if (typeof value !== 'string') return 'Value must be a string'
      break
    
    case 'URL':
      if (typeof value !== 'string' || !value.startsWith('http')) {
        return 'Value must be a valid URL'
      }
      break
    
    case 'SELECT':
      if (!options) return 'Select field must have options'
      if (!options.includes(value)) {
        return `Value must be one of: ${options.join(', ')}`
      }
      break
  }

  return null
}
