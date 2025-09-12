import { NextRequest, NextResponse } from 'next/server';
import { createAdminApiHandler } from '@/lib/admin-api-guard';
import { getAllAdmins, addAdmin, removeAdmin } from '@/lib/admin-manager';

async function GET(request: NextRequest) {
  try {
    const admins = await getAllAdmins();
    
    return NextResponse.json({
      success: true,
      admins: admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user } = body;
    
    if (!user || !user.email || !user.name || !user.id) {
      return NextResponse.json(
        { error: 'User data is required (id, name, email)' },
        { status: 400 }
      );
    }
    
    await addAdmin(user);
    
    return NextResponse.json({
      success: true,
      message: 'Admin added successfully'
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json(
      { error: 'Failed to add admin' },
      { status: 500 }
    );
  }
}

async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    await removeAdmin(email);
    
    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json(
      { error: 'Failed to remove admin' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const { GET: protectedGET, POST: protectedPOST, DELETE: protectedDELETE } = createAdminApiHandler({
  GET,
  POST,
  DELETE
});

export { protectedGET as GET, protectedPOST as POST, protectedDELETE as DELETE };
