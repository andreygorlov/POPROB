import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { entityType, clientId, systemFields } = await request.json()

    if (!entityType || !systemFields || !Array.isArray(systemFields)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const createdFields = []

    for (const field of systemFields) {
      try {
        // Check if system field already exists
        const existingField = await prisma.customField.findUnique({
          where: {
            name_entityType_clientId: {
              name: field.name,
              entityType: field.entityType,
              clientId: clientId || 'default'
            }
          }
        })

        if (existingField) {
          console.log(`System field ${field.name} already exists for ${entityType}`)
          continue
        }

        // Create the system field
        const createdField = await prisma.customField.create({
          data: {
            name: field.name,
            label: field.label,
            type: field.type,
            entityType: field.entityType,
            options: field.options ? JSON.stringify(field.options) : null,
            required: field.required,
            order: field.order,
            isActive: field.isActive,
            description: field.description,
            clientId: clientId || 'default'
          }
        })

        createdFields.push({
          ...createdField,
          options: createdField.options ? JSON.parse(createdField.options) : undefined,
          isSystem: true
        })
      } catch (error) {
        console.error(`Error creating system field ${field.name}:`, error)
        // Continue with other fields even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      customFields: createdFields,
      message: `Created ${createdFields.length} system fields for ${entityType}`
    })

  } catch (error) {
    console.error('Error creating system fields:', error)
    return NextResponse.json(
      { error: 'Failed to create system fields' },
      { status: 500 }
    )
  }
}
