import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

/**
 * 認證中介層 - 驗證用戶是否已登入
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    // 從 cookie 中獲取 session
    const supabase = createServerClient();

    // 檢查用戶會話
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('認證錯誤:', error);
      return NextResponse.json(
        { error: '認證失敗', details: error.message },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '未授權訪問，請先登入' },
        { status: 401 }
      );
    }

    // 檢查用戶是否啟用
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_active, role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('獲取用戶資料錯誤:', profileError);
      return NextResponse.json(
        { error: '獲取用戶資料失敗' },
        { status: 500 }
      );
    }

    if (!profile?.is_active) {
      return NextResponse.json(
        { error: '帳號已停用，請聯繫管理員' },
        { status: 403 }
      );
    }

    // 認證成功，返回 null 表示可以繼續處理請求
    return null;
  } catch (error) {
    console.error('認證中介層錯誤:', error);
    return NextResponse.json(
      { error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}

/**
 * 角色權限檢查中介層
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<NextResponse | null> {
  // 先檢查基本認證
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    // 檢查用戶角色
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('獲取用戶角色錯誤:', profileError);
      return NextResponse.json(
        { error: '獲取用戶角色失敗' },
        { status: 500 }
      );
    }

    if (!profile?.role || !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: '權限不足' },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error('角色權限檢查錯誤:', error);
    return NextResponse.json(
      { error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}