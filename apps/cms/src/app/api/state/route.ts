import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme } = body;

    // Here you can add user state saving logic
    // For example, to a database or in cookies
    
    // For now, just return a successful response
    return NextResponse.json({ 
      success: true, 
      theme,
      message: 'Theme updated successfully' 
    });
  } catch (error) {
    console.error('Error updating state:', error);
    return NextResponse.json(
      { error: 'Failed to update state' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // You can add logic to get the current state
  return NextResponse.json({ 
    theme: 'light', // default value
    message: 'State retrieved successfully' 
  });
}